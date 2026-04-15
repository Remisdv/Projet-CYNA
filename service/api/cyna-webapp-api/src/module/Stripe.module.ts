import { Module, Global } from '@nestjs/common';
import { StripeService } from '../service/Stripe/Stripe.service';

@Global()
@Module({
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
