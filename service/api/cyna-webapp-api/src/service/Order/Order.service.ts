import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CustomerOrderRepository } from '../../repository/Order/Order.repository';
import { OrderMapper } from './mappers/Order.mapper';
import { OrderResponseDto } from './dtos/Order.dto';
import { InvoiceService } from '../Invoice/Invoice.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: CustomerOrderRepository,
    private readonly mapper: OrderMapper,
    private readonly invoiceService: InvoiceService,
  ) { }

  async findAllByUser(userId: string, page = 1, perPage = 10): Promise<{ data: OrderResponseDto[]; total: number }> {
    const [entities, total] = await this.orderRepository.findAndCountByUser(userId, page, perPage);
    return { data: this.mapper.toDtoArray(entities), total };
  }

  async findOne(id: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.userId !== userId) throw new ForbiddenException('Accès refusé');
    return this.mapper.toDto(order);
  }

  async generateInvoicePdf(id: string, userId: string): Promise<Buffer> {
    return this.invoiceService.generateInvoicePdf(id, userId);
  }
}
