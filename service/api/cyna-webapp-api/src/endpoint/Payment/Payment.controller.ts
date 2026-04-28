import { Controller, Post, Body, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from '../../service/Payment/Payment.service';
import { StripeService } from '../../service/Stripe/Stripe.service';
import { CreatePaymentIntentDto, ConfirmOrderDto } from '../../service/Payment/dtos/Payment.dto';

@Controller()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) { }

  @Post('payment-intents')
  async createPaymentIntent(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentService.createPaymentIntent(userId, dto);
  }

  @Post('payment-intents/confirmations')
  async confirmPayment(
    @Headers('x-user-id') userId: string,
    @Body() dto: ConfirmOrderDto,
  ) {
    return this.paymentService.confirmOrder(userId, dto.orderId);
  }

  @Post('stripe-webhooks')
  async handleWebhook(@Req() req: RawBodyRequest<Request>): Promise<{ received: boolean }> {
    const signature = req.headers['stripe-signature'] as string;
    const event = this.stripeService.constructEvent(req.rawBody, signature);
    await this.paymentService.handleWebhook(event);
    return { received: true };
  }
}
