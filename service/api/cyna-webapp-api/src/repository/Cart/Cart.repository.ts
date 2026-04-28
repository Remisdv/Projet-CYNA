import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CartItem } from '../../database/entity/Cart/CartItem.entity';

@Injectable()
export class CartRepository {
    constructor(
        @InjectRepository(CartItem)
        private readonly repo: Repository<CartItem>,
    ) { }

    findAllByUser(userId: string): Promise<CartItem[]> {
        return this.repo.find({ where: { userId }, order: { createdAt: 'ASC' } });
    }

    findOneByUserProductPeriodicity(
        userId: string,
        productId: string,
        periodicity: string,
    ): Promise<CartItem | null> {
        return this.repo.findOne({ where: { userId, productId, periodicity } });
    }

    findOneByIdAndUser(id: string, userId: string): Promise<CartItem | null> {
        return this.repo.findOne({ where: { id, userId } });
    }

    findExpiredReservations(now: Date): Promise<CartItem[]> {
        return this.repo.find({
            where: {
                stockReserved: true,
                reservationExpiresAt: LessThanOrEqual(now),
            },
        });
    }

    create(data: Partial<CartItem>): CartItem {
        return this.repo.create(data);
    }

    save(entity: CartItem): Promise<CartItem> {
        return this.repo.save(entity);
    }

    remove(entity: CartItem): Promise<CartItem> {
        return this.repo.remove(entity);
    }

    removeMany(entities: CartItem[]): Promise<CartItem[]> {
        return this.repo.remove(entities);
    }
}
