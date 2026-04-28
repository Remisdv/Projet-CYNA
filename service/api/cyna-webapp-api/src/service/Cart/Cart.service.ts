import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CartItem } from '../../database/entity/Cart/CartItem.entity';
import { AddCartItemDto, UpdateCartItemDto, MergeCartDto } from './dtos/Cart.dto';
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
      await this.reserveStock(dto.productId, quantity);
      existing.reservationExpiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);
      return this.cartRepository.save(existing);
    }

    // Reserve stock for new item
    await this.reserveStock(dto.productId, quantity);

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
      await this.reserveStock(item.productId, diff);
    } else if (diff < 0) {
      await this.releaseStock(item.productId, Math.abs(diff));
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
      await this.releaseStock(item.productId, item.quantity);
    }

    await this.cartRepository.remove(item);
  }

  async clearCart(userId: string): Promise<void> {
    const items = await this.cartRepository.findAllByUser(userId);
    for (const item of items) {
      if (item.stockReserved) {
        await this.releaseStock(item.productId, item.quantity);
      }
    }
    await this.cartRepository.removeMany(items);
  }

  async mergeLocalCart(userId: string, dto: MergeCartDto): Promise<CartItem[]> {
    for (const localItem of dto.items) {
      const existing = await this.cartRepository.findOneByUserProductPeriodicity(
        userId,
        localItem.productId,
        localItem.periodicity ?? '',
      );

      if (existing) {
        // If already in server cart, keep existing (don't duplicate)
        continue;
      }

      const quantity = localItem.quantity ?? 1;

      // Best-effort stock reservation: if it fails (stock insuffisant, produit supprimé,
      // service-api injoignable), on garde quand même la ligne dans le panier pour
      // ne pas perdre le contenu client au login.
      let reserved = false;
      try {
        await this.reserveStock(localItem.productId, quantity);
        reserved = true;
      } catch (err) {
        this.logger.warn(
          `Merge: skipping stock reservation for ${localItem.productId}: ${err?.message ?? err}`,
        );
      }

      const item = this.cartRepository.create({
        userId,
        productId: localItem.productId,
        productName: localItem.productName,
        productType: localItem.productType,
        quantity,
        prix: localItem.prix,
        prixMensuel: localItem.prixMensuel,
        prixAnnuel: localItem.prixAnnuel,
        periodicity: localItem.periodicity ?? '',
        image: localItem.image,
        stockReserved: reserved,
        reservationExpiresAt: reserved ? new Date(Date.now() + RESERVATION_DURATION_MS) : null,
      });

      try {
        await this.cartRepository.save(item);
      } catch (err) {
        this.logger.warn(
          `Merge: failed to save cart item ${localItem.productId}: ${err?.message ?? err}`,
        );
        if (reserved) {
          // Undo the reservation we just made
          await this.releaseStock(localItem.productId, quantity);
        }
      }
    }
    return this.getCart(userId);
  }

  /** Mark cart items as purchased so stock is NOT released */
  async markPurchased(userId: string): Promise<void> {
    const items = await this.cartRepository.findAllByUser(userId);
    await this.cartRepository.removeMany(items);
  }

  /* ─── Stock Management via service-api ─────────────────────── */

  private async reserveStock(productId: string, quantity: number): Promise<void> {
    try {
      const product = await this.httpClient.get(`/api/products/${productId}`);
      const data = product?.data ?? product;
      if (data.stock_illimite === 'illimité') return; // unlimited stock
      const currentStock = data.stock ?? 0;
      if (currentStock < quantity) {
        throw new BadRequestException(`Stock insuffisant (disponible: ${currentStock})`);
      }
      await this.httpClient.put(`/api/products/${productId}`, {
        stock: currentStock - quantity,
      });
      this.logger.log(`Reserved ${quantity} stock for product ${productId}`);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Failed to reserve stock: ${err.message}`);
      // Don't block cart add if stock service is unavailable
    }
  }

  private async releaseStock(productId: string, quantity: number): Promise<void> {
    try {
      const product = await this.httpClient.get(`/api/products/${productId}`);
      const data = product?.data ?? product;
      if (data.stock_illimite === 'illimité') return;
      const currentStock = data.stock ?? 0;
      await this.httpClient.put(`/api/products/${productId}`, {
        stock: currentStock + quantity,
      });
      this.logger.log(`Released ${quantity} stock for product ${productId}`);
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
      await this.releaseStock(item.productId, item.quantity);
      item.stockReserved = false;
      await this.cartRepository.save(item);
    }
  }
}
