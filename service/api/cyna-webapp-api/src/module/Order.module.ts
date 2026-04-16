import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrder } from '../database/entity/Order/CustomerOrder.entity';
import { OrderController } from '../endpoint/Order/Order.controller';
import { OrderService } from '../service/Order/Order.service';
import { OrderMapper } from '../mapper/Order.mapper';
import { InvoiceModule } from './Invoice.module';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrder]), InvoiceModule],
  controllers: [OrderController],
  providers: [OrderService, OrderMapper],
  exports: [OrderService],
})
export class OrderModule { }
