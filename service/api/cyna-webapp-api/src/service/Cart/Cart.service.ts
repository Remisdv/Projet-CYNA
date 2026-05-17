import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CartItem } from '../../database/entity/Cart/CartItem.entity';
import { AddCartItemDto, UpdateCartItemDto } from './dtos/Cart.dto';
import { HttpClientService } from '../../common/services/http-client.service';
import { CartRepository } from '../../repository/Cart/Cart.repository';

const RESERVATION_DURATION_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly httpClient: HttpClientService,
  ) { }

  async getCart(userId: string): Promise<CartItem[]> {
    return this.cartRepository.findAllByUser(userId);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartItem> {
    const quantity = dto.quantity ?? 1;

    // Check for existing item (same product + periodicity)
    const existing = await this.cartRepository.findOneByUserProductPeriodicity(
      userId,
      dto.productId,
      dto.periodicity ?? '',
    );

    if (existing) {
      existing.quantity += quantity;
      // Reserve additional stock
      await this.reserveStock(dto.productId, dto.productType, quantity);
      existing.reservationExpiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);
      return this.cartRepository.save(existing);
    }

    // Reserve stock for new item
    await this.reserveStock(dto.productId, dto.productType, quantity);

    const item = this.cartRepository.create({
      userId,
      productId: dto.productId,
      productName: dto.productName,
      productType: dto.productType,
      quantity,
      prix: dto.prix,
      prixMensuel: dto.prixMensuel,
      prixAnnuel: dto.prixAnnuel,
      periodicity: dto.periodicity ?? '',
      image: dto.image,
      stockReserved: true,
      reservationExpiresAt: new Date(Date.now() + RESERVATION_DURATION_MS),
    });

    return this.cartRepository.save(item);
  }

  async updateQuantity(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartItem> {
    const item = await this.cartRepository.findOneByIdAndUser(itemId, userId);
    if (!item) throw new BadRequestException('Article introuvable');

    const diff = dto.quantity - item.quantity;
    if (diff > 0) {
      await this.reserveStock(item.productId, item.productType, diff);
    } else if (diff < 0) {
      await this.releaseStock(item.productId, item.productType, Math.abs(diff));
    }

    item.quantity = dto.quantity;
    item.reservationExpiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);

    if (item.quantity <= 0) {
      await this.cartRepository.remove(item);
      return item;
    }

    return this.cartRepository.save(item);
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const item = await this.cartRepository.findOneByIdAndUser(itemId, userId);
    if (!item) return;

    if (item.stockReserved) {
      await this.releaseStock(item.productId, item.productType, item.quantity);
    }

    await this.cartRepository.remove(item);
  }

  async clearCart(userId: string): Promise<void> {
    const items = await this.cartRepository.findAllByUser(userId);
    for (const item of items) {
      if (item.stockReserved) {
        await this.releaseStock(item.productId, item.productType, item.quantity);
      }
    }
    await this.cartRepository.removeMany(items);
  }

  /** Mark cart items as purchased so stock is NOT released */
  async markPurchased(userId: string): Promise<void> {
    const items = await this.cartRepository.findAllByUser(userId);
    await this.cartRepository.removeMany(items);
  }

  /* ─── Stock Management via service-api ─────────────────────── */

  /** Returns the correct base path depending on item type */
  private itemApiPath(productId: string, productType: string): string {
    return productType === 'service' ? `/api/services/${productId}` : `/api/products/${productId}`;
  }

  private async reserveStock(productId: string, productType: string, quantity: number): Promise<void> {
    let data: any;
    try {
      const apiPath = this.itemApiPath(productId, productType);
      const response = await this.httpClient.get(apiPath);
      data = response?.data ?? response;
    } catch (err) {
      this.logger.error(`Failed to fetch ${productType} ${productId} for stock reservation: ${err.message}`);
      // service-api unreachable: don't block cart add, but log loudly.
      return;
    }

    // Guard: if response is null or an HTTP error (404, etc.), don't block the cart.
    if (!data || (data.statusCode && data.statusCode >= 400)) {
      this.logger.warn(`${productType} ${productId} not found for stock check — skipping reservation`);
      return;
    }

    if (data.stock_illimite === 'illimité' || data.stock == null) return; // unlimited / no stock field
    const currentStock = data.stock ?? 0;
    if (currentStock < quantity) {
      throw new BadRequestException(`Stock insuffisant (disponible: ${currentStock})`);
    }
    const apiPath = this.itemApiPath(productId, productType);
    try {
      await this.httpClient.put(apiPath, {
        stock: currentStock - quantity,
      });
      this.logger.log(`Reserved ${quantity} stock for ${productType} ${productId}`);
    } catch (err) {
      this.logger.error(`Failed to update stock for ${productType} ${productId}: ${err.message}`);
      throw new BadRequestException('Impossible de réserver le stock, veuillez réessayer.');
    }
  }

  private async releaseStock(productId: string, productType: string, quantity: number): Promise<void> {
    try {
      const apiPath = this.itemApiPath(productId, productType);
      const response = await this.httpClient.get(apiPath);
      const data = response?.data ?? response;
      if (!data || (data.statusCode && data.statusCode >= 400)) return;
      if (data.stock_illimite === 'illimité' || data.stock == null) return;
      const currentStock = data.stock ?? 0;
      await this.httpClient.put(apiPath, {
        stock: currentStock + quantity,
      });
      this.logger.log(`Released ${quantity} stock for ${productType} ${productId}`);
    } catch (err) {
      this.logger.error(`Failed to release stock: ${err.message}`);
    }
  }

  /* ─── Cron: release expired reservations ───────────────────── */

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredReservations(): Promise<void> {
    const now = new Date();
    const expired = await this.cartRepository.findExpiredReservations(now);

    if (expired.length === 0) return;

    this.logger.log(`Releasing ${expired.length} expired cart reservations`);

    for (const item of expired) {
      await this.releaseStock(item.productId, item.productType, item.quantity);
      item.stockReserved = false;
      await this.cartRepository.save(item);
    }
  }
}
