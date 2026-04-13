import { Controller, Get, Param, Query } from '@nestjs/common';
import { OrderService } from '../../service/order/order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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
}
