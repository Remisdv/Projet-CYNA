import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderEntity, OrderStatus, PaymentStatus } from '../../database/entity/order';
import { OrderRepository } from '../../repository/order/order.repository';
import { EmailService } from '../email/email.service';
import { SyncOrderDto, PatchOrderDto } from './dtos/order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly emailService: EmailService,
  ) { }

  async syncFromWebapp(dto: SyncOrderDto): Promise<OrderEntity> {
    // Upsert by ref to avoid duplicates
    const existing = await this.orderRepository.findByRef(dto.ref);
    if (existing) {
      // Update all fields on re-sync
      if (dto.status) existing.status = dto.status as OrderStatus;
      if (dto.paymentStatus) existing.paymentStatus = dto.paymentStatus as PaymentStatus;
      if (dto.amount != null) existing.amount = dto.amount;
      if (dto.items?.length) {
        existing.items = dto.items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          productType: i.productType,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal ?? i.unitPrice * i.quantity,
        }));
      }
      if (dto.billingAddress) existing.billingAddress = dto.billingAddress;
      if (dto.clientEmail) existing.clientEmail = dto.clientEmail;
      if (dto.clientFirstName) existing.clientFirstName = dto.clientFirstName;
      if (dto.clientLastName) existing.clientLastName = dto.clientLastName;

      // Add history entry for status changes
      const statusChanged = dto.status && dto.status !== existing.status;
      if (statusChanged) {
        existing.history = [
          ...(existing.history || []),
          {
            action: `Statut mis à jour: "${dto.status}"`,
            date: new Date().toISOString(),
            by: 'webapp-sync',
          },
        ];
      }

      return this.orderRepository.save(existing);
    }

    const order = this.orderRepository.create({
      ref: dto.ref,
      clientEmail: dto.clientEmail,
      clientFirstName: dto.clientFirstName,
      clientLastName: dto.clientLastName,
      items: dto.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        productType: i.productType,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal ?? i.unitPrice * i.quantity,
      })),
      amount: dto.amount,
      status: (dto.status as OrderStatus) || OrderStatus.PENDING,
      paymentStatus: (dto.paymentStatus as PaymentStatus) || PaymentStatus.PENDING,
      billingAddress: dto.billingAddress,
      history: [{
        action: 'Commande créée depuis le site',
        date: dto.createdAt || new Date().toISOString(),
        by: 'webapp',
      }],
    });

    return this.orderRepository.save(order);
  }

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

    const [items, total] = await this.orderRepository.findAndCount(where, skip, per_page);

    return {
      items,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };
  }

  async findById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async findByRef(ref: string): Promise<OrderEntity | null> {
    return this.orderRepository.findByRef(ref);
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
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Transition de "${order.status}" vers "${status}" non autorisée`,
      );
    }

    order.status = status;

    if (status === OrderStatus.SHIPPED) {
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

    const saved = await this.orderRepository.save(order);

    // Notify customer by email
    if (order.clientEmail) {
      await this.emailService.sendOrderStatusUpdate(order.clientEmail, {
        ref: order.ref,
        status,
        trackingNumber: order.trackingNumber,
      });
    }

    return saved;
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
        action: `Paiement changé en "${paymentStatus}"`,
        date: new Date().toISOString(),
        by,
      },
    ];

    const saved = await this.orderRepository.save(order);

    // Notify customer by email
    if (order.clientEmail) {
      await this.emailService.sendPaymentStatusUpdate(order.clientEmail, {
        ref: order.ref,
        paymentStatus,
        amount: order.amount,
      });
    }

    return saved;
  }

  async patchUpdate(id: string, dto: PatchOrderDto, by: string): Promise<OrderEntity> {
    let order = await this.findById(id);
    if (dto.status !== undefined) {
      order = await this.updateStatus(id, dto.status, by, dto.trackingNumber);
    } else if (dto.trackingNumber !== undefined) {
      order.trackingNumber = dto.trackingNumber;
      order = await this.orderRepository.save(order);
    }
    if (dto.paymentStatus !== undefined) {
      order = await this.updatePaymentStatus(id, dto.paymentStatus, by);
    }
    return order;
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

  async sendCredentials(
    id: string,
    credentials: Array<{ serviceName: string; data: Record<string, string> }>,
    customMessage: string | undefined,
    by: string,
  ): Promise<OrderEntity> {
    const order = await this.findById(id);

    const timestamped = credentials.map(c => ({
      ...c,
      sentAt: new Date().toISOString(),
    }));

    order.credentials = [
      ...(order.credentials || []),
      ...timestamped,
    ];

    order.history = [
      ...(order.history || []),
      {
        action: `Identifiants envoyés pour: ${credentials.map(c => c.serviceName).join(', ')}`,
        date: new Date().toISOString(),
        by,
      },
    ];

    const saved = await this.orderRepository.save(order);

    if (order.clientEmail) {
      await this.emailService.sendServiceCredentials(order.clientEmail, {
        ref: order.ref,
        credentials: timestamped,
        customMessage,
      });
    }

    return saved;
  }
}
