import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrder } from '../database/entity/Order/CustomerOrder.entity';
import { OrderController } from '../endpoint/Order/Order.controller';
import { OrderService } from '../service/Order/Order.service';
import { OrderMapper } from '../service/mappers/Order.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrder])],
  controllers: [OrderController],
  providers: [OrderService, OrderMapper],
})
export class OrderModule {}
