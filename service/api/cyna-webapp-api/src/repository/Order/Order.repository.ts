import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerOrder } from '../../database/entity/Order/CustomerOrder.entity';

@Injectable()
export class CustomerOrderRepository {
    constructor(
        @InjectRepository(CustomerOrder)
        private readonly repo: Repository<CustomerOrder>,
    ) { }

    findById(id: string): Promise<CustomerOrder | null> {
        return this.repo.findOneBy({ id });
    }

    findByIdAndUser(id: string, userId: string): Promise<CustomerOrder | null> {
        return this.repo.findOneBy({ id, userId });
    }

    findByPaymentIntentId(paymentIntentId: string): Promise<CustomerOrder | null> {
        return this.repo.findOneBy({ paymentIntentId });
    }

    findAndCountByUser(
        userId: string,
        page: number,
        perPage: number,
    ): Promise<[CustomerOrder[], number]> {
        return this.repo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * perPage,
            take: perPage,
        });
    }

    create(data: Partial<CustomerOrder>): CustomerOrder {
        return this.repo.create(data);
    }

    save(entity: CustomerOrder): Promise<CustomerOrder> {
        return this.repo.save(entity);
    }
}
