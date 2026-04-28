import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CartItem } from '../database/entity/Cart/CartItem.entity';
import { CartService } from '../service/Cart/Cart.service';
import { CartController } from '../endpoint/Cart/Cart.controller';
import { CartRepository } from '../repository/Cart/Cart.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    ScheduleModule.forRoot(),
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartModule { }
