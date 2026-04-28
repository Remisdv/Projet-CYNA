import { Controller, Get, Patch, Post, Param, Query, Body, Headers } from '@nestjs/common';
import { OrderService } from '../../service/order/order.service';
import {
  UpdateStatusDto,
  UpdatePaymentStatusDto,
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
  ) {
    return this.orderService.findAll({ page, per_page, status });
  }

  @Get('by-ref/:ref')
  async findByRef(@Param('ref') ref: string) {
    return this.orderService.findByRef(ref);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Post('sync')
  async syncFromWebapp(@Body() body: SyncOrderBodyDto) {
    return this.orderService.syncFromWebapp(body);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
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
    @Body() body: UpdatePaymentStatusDto,
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
    @Body() body: AddNoteDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.addNote(id, body.text, userId || 'admin');
  }

  @Post(':id/credentials')
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
