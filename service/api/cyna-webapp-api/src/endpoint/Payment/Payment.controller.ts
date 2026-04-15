import { Controller, Post, Body, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from '../../service/Payment/Payment.service';
import { StripeService } from '../../service/Stripe/Stripe.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from '../../service/dtos/Payment/Payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('create-intent')
  async createPaymentIntent(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentService.createPaymentIntent(userId, dto);
  }

  @Post('stripe/webhook')
  async handleWebhook(@Req() req: RawBodyRequest<Request>): Promise<{ received: boolean }> {
    const signature = req.headers['stripe-signature'] as string;
    const event = this.stripeService.constructEvent(req.rawBody, signature);
    await this.paymentService.handleWebhook(event);
    return { received: true };
  }
}
