import { Module } from '@nestjs/common';
import { PaymentController } from '../endpoint/Payment/Payment.controller';
import { PaymentService } from '../service/Payment/Payment.service';
import { CheckoutModule } from './Checkout.module';
import { SyncModule } from './Sync.module';
import { OrderModule } from './Order.module';
import { AccountModule } from './Account.module';
import { SubscriptionModule } from './Subscription.module';

@Module({
  imports: [
    OrderModule,
    AccountModule,
    SubscriptionModule,
    CheckoutModule,
    SyncModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule { }
