import { Controller, Get, Patch, Post, Param, Query, Body, Headers } from '@nestjs/common';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray, IsEmail, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderService } from '../../service/order/order.service';
import { OrderStatus, PaymentStatus } from '../../database/entity/order';

class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}

class AddNoteDto {
  @IsString()
  text: string;
}

class SyncOrderBodyDto {
  @IsString()
  ref: string;

  @IsEmail()
  clientEmail: string;

  @IsOptional()
  @IsString()
  clientFirstName?: string;

  @IsOptional()
  @IsString()
  clientLastName?: string;

  @IsArray()
  items: any[];

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsObject()
  billingAddress?: any;

  @IsOptional()
  @IsObject()
  shippingAddress?: any;

  @IsOptional()
  @IsString()
  createdAt?: string;
}

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
}
