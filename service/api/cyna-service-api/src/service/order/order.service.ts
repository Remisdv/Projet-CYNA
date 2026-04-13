import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from '../../database/entity/order';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async findAll(params: {
    page?: number;
    per_page?: number;
    status?: string;
  }) {
    const page = Number(params.page) || 1;
    const per_page = Number(params.per_page) || 25;
    const skip = (page - 1) * per_page;

    const where: Partial<{ status: OrderStatus }> = {};
    if (params.status && Object.values(OrderStatus).includes(params.status as OrderStatus)) {
      where.status = params.status as OrderStatus;
    }

    const [items, total] = await this.orderRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: per_page,
    });

    return {
      items,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };
  }

  async findById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }
}
