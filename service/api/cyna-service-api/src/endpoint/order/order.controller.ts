import { Controller, Get, Patch, Post, Param, Query, Body, Headers } from '@nestjs/common';
import { OrderService } from '../../service/order/order.service';
import {
  PatchOrderDto,
  AddNoteDto,
  SendCredentialsDto,
  SyncOrderBodyDto,
} from '../../service/order/dtos/order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
    @Query('status') status?: string,
    @Query('ref') ref?: string,
  ) {
    if (ref) {
      const order = await this.orderService.findByRef(ref);
      return order ? [order] : [];
    }
    return this.orderService.findAll({ page, per_page, status });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  /**
   * POST /orders
   * Idempotent create: if an order with the same ref already exists it is updated.
   */
  @Post()
  async create(@Body() body: SyncOrderBodyDto) {
    return this.orderService.syncFromWebapp(body);
  }

  /**
   * PATCH /orders/:id
   * Partial order update: status, paymentStatus, trackingNumber.
   */
  @Patch(':id')
  async patchUpdate(
    @Param('id') id: string,
    @Body() body: PatchOrderDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.patchUpdate(id, body, userId || 'admin');
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() body: AddNoteDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.addNote(id, body.text, userId || 'admin');
  }

  @Post(':id/credential-deliveries')
  async sendCredentials(
    @Param('id') id: string,
    @Body() body: SendCredentialsDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.sendCredentials(
      id,
      body.credentials,
      body.customMessage,
      userId || 'admin',
    );
  }
}

