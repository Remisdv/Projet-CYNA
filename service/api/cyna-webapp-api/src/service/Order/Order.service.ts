import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerOrder } from '../../database/entity/Order/CustomerOrder.entity';
import { OrderMapper } from '../../mapper/Order.mapper';
import { OrderResponseDto } from '../../dto/Order/Order.dto';
import { InvoiceService } from '../Invoice/Invoice.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(CustomerOrder)
    private readonly repo: Repository<CustomerOrder>,
    private readonly mapper: OrderMapper,
    private readonly invoiceService: InvoiceService,
  ) { }

  async findAllByUser(userId: string, page = 1, perPage = 10): Promise<{ data: OrderResponseDto[]; total: number }> {
    const [entities, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { data: this.mapper.toDtoArray(entities), total };
  }

  async findOne(id: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.repo.findOneBy({ id });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.userId !== userId) throw new ForbiddenException('Accès refusé');
    return this.mapper.toDto(order);
  }

  async generateInvoicePdf(id: string, userId: string): Promise<Buffer> {
    return this.invoiceService.generateInvoicePdf(id, userId);
  }
}
