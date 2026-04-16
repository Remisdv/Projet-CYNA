import { Controller, Get, Patch, Post, Param, Query, Body, Headers } from '@nestjs/common';
import { OrderService } from '../../service/order/order.service';
import { OrderStatus, PaymentStatus } from '../../database/entity/order';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
    @Query('status') status?: string,
  ) {
    return this.orderService.findAll({ page, per_page, status });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; trackingNumber?: string },
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.updateStatus(
      id,
      body.status,
      userId || 'admin',
      body.trackingNumber,
    );
  }

  @Patch(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paymentStatus: PaymentStatus },
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.updatePaymentStatus(
      id,
      body.paymentStatus,
      userId || 'admin',
    );
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() body: { text: string },
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.addNote(id, body.text, userId || 'admin');
  }
}
