import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebappUser } from '../database/entity/WebappUser/WebappUser.entity';
import { CustomerOrder } from '../database/entity/Order/CustomerOrder.entity';
import { WebappSubscription } from '../database/entity/Subscription/WebappSubscription.entity';
import { PaymentController } from '../endpoint/Payment/Payment.controller';
import { PaymentService } from '../service/Payment/Payment.service';
import { CartModule } from './Cart.module';

@Module({
  imports: [TypeOrmModule.forFeature([WebappUser, CustomerOrder, WebappSubscription]), CartModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
