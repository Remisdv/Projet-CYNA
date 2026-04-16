import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus, PaymentStatus } from '../../database/entity/order';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) { }

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

  async updateStatus(
    id: string,
    status: OrderStatus,
    by: string,
    trackingNumber?: string,
  ): Promise<OrderEntity> {
    const order = await this.findById(id);

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Transition de "${order.status}" vers "${status}" non autorisée`,
      );
    }

    order.status = status;

    if (status === OrderStatus.DELIVERED) {
      if (trackingNumber) order.trackingNumber = trackingNumber;
      order.shippedAt = new Date();
    }

    order.history = [
      ...(order.history || []),
      {
        action: `Statut changé en "${status}"`,
        date: new Date().toISOString(),
        by,
      },
    ];

    return this.orderRepository.save(order);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    by: string,
  ): Promise<OrderEntity> {
    const order = await this.findById(id);

    order.paymentStatus = paymentStatus;

    if (paymentStatus === PaymentStatus.PAID && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.CONFIRMED;
    }

    order.history = [
      ...(order.history || []),
      {
        action: `Paiement change en "${paymentStatus}"`,
        date: new Date().toISOString(),
        by,
      },
    ];

    return this.orderRepository.save(order);
  }

  async addNote(id: string, text: string, by: string): Promise<OrderEntity> {
    const order = await this.findById(id);

    const currentNotes = order.notes ? order.notes + '\n' : '';
    order.notes = currentNotes + `[${new Date().toISOString()}] (${by}) ${text}`;

    order.history = [
      ...(order.history || []),
      {
        action: `Note ajoutée: "${text.substring(0, 50)}"`,
        date: new Date().toISOString(),
        by,
      },
    ];

    return this.orderRepository.save(order);
  }
}
