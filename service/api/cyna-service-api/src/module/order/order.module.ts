import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../database/entity/order';
import { OrderService } from '../../service/order/order.service';
import { OrderController } from '../../endpoint/order/order.controller';
import { OrderRepository } from '../../repository/order/order.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository],
})
export class OrderModule { }
