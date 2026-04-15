import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as http from 'http';
import { CartItem } from '../../database/entity/Cart/CartItem.entity';
import { AddCartItemDto, UpdateCartItemDto, MergeCartDto } from '../dtos/Cart/Cart.dto';

const RESERVATION_DURATION_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly serviceApiUrl: string;

  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
  ) {
    this.serviceApiUrl = process.env.SERVICE_API_URL || 'http://cyna-service-api:3000';
  }

  async getCart(userId: string): Promise<CartItem[]> {
    return this.cartRepo.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartItem> {
    const quantity = dto.quantity ?? 1;

    // Check for existing item (same product + periodicity)
    const existing = await this.cartRepo.findOne({
      where: { userId, productId: dto.productId, periodicity: dto.periodicity ?? '' },
    });

    if (existing) {
      existing.quantity += quantity;
      // Reserve additional stock
      await this.reserveStock(dto.productId, quantity);
      existing.reservationExpiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);
      return this.cartRepo.save(existing);
    }

    // Reserve stock for new item
    await this.reserveStock(dto.productId, quantity);

    const item = this.cartRepo.create({
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

    return this.cartRepo.save(item);
  }

  async updateQuantity(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartItem> {
    const item = await this.cartRepo.findOne({ where: { id: itemId, userId } });
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
      await this.cartRepo.remove(item);
      return item;
    }

    return this.cartRepo.save(item);
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const item = await this.cartRepo.findOne({ where: { id: itemId, userId } });
    if (!item) return;

    if (item.stockReserved) {
      await this.releaseStock(item.productId, item.quantity);
    }

    await this.cartRepo.remove(item);
  }

  async clearCart(userId: string): Promise<void> {
    const items = await this.cartRepo.find({ where: { userId } });
    for (const item of items) {
      if (item.stockReserved) {
        await this.releaseStock(item.productId, item.quantity);
      }
    }
    await this.cartRepo.remove(items);
  }

  async mergeLocalCart(userId: string, dto: MergeCartDto): Promise<CartItem[]> {
    for (const localItem of dto.items) {
      const existing = await this.cartRepo.findOne({
        where: { userId, productId: localItem.productId, periodicity: localItem.periodicity ?? '' },
      });

      if (!existing) {
        await this.addItem(userId, localItem);
      }
      // If already in server cart, keep existing (don't duplicate)
    }
    return this.getCart(userId);
  }

  /** Mark cart items as purchased so stock is NOT released */
  async markPurchased(userId: string): Promise<void> {
    const items = await this.cartRepo.find({ where: { userId } });
    await this.cartRepo.remove(items);
  }

  /* ─── Stock Management via service-api ─────────────────────── */

  private async reserveStock(productId: string, quantity: number): Promise<void> {
    try {
      const product = await this.callServiceApi('GET', `/api/products/${productId}`);
      const data = product?.data ?? product;
      if (data.stock_illimite === 'illimité') return; // unlimited stock
      const currentStock = data.stock ?? 0;
      if (currentStock < quantity) {
        throw new BadRequestException(`Stock insuffisant (disponible: ${currentStock})`);
      }
      await this.callServiceApi('PUT', `/api/products/${productId}`, {
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
      const product = await this.callServiceApi('GET', `/api/products/${productId}`);
      const data = product?.data ?? product;
      if (data.stock_illimite === 'illimité') return;
      const currentStock = data.stock ?? 0;
      await this.callServiceApi('PUT', `/api/products/${productId}`, {
        stock: currentStock + quantity,
      });
      this.logger.log(`Released ${quantity} stock for product ${productId}`);
    } catch (err) {
      this.logger.error(`Failed to release stock: ${err.message}`);
    }
  }

  private callServiceApi(method: string, path: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.serviceApiUrl);
      const headers: Record<string, string> = {};
      let bodyStr: string | undefined;

      if (body) {
        bodyStr = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(bodyStr).toString();
      }

      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method,
          headers,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString()));
            } catch {
              resolve(null);
            }
          });
        },
      );

      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }

  /* ─── Cron: release expired reservations ───────────────────── */

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredReservations(): Promise<void> {
    const now = new Date();
    const expired = await this.cartRepo.find({
      where: {
        stockReserved: true,
        reservationExpiresAt: LessThanOrEqual(now),
      },
    });

    if (expired.length === 0) return;

    this.logger.log(`Releasing ${expired.length} expired cart reservations`);

    for (const item of expired) {
      await this.releaseStock(item.productId, item.quantity);
      item.stockReserved = false;
      await this.cartRepo.save(item);
    }
  }
}
