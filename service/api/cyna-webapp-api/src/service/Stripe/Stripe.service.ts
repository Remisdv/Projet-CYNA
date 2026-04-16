import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: InstanceType<typeof Stripe> | null = null;
  private readonly logger = new Logger(StripeService.name);

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key);
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY is not set – Stripe features will be unavailable',
      );
    }
  }

  private getClient(): InstanceType<typeof Stripe> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured (missing STRIPE_SECRET_KEY)');
    }
    return this.stripe;
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.getClient().customers.create({ email, name });
    return customer.id;
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    metadata: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const intent = await this.getClient().paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      metadata,
    });
    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  async createSubscription(
    customerId: string,
    priceAmount: number,
    interval: 'month' | 'year',
    productName: string,
    metadata: Record<string, string>,
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    const price = await this.getClient().prices.create({
      unit_amount: Math.round(priceAmount * 100),
      currency: 'eur',
      recurring: { interval },
      product_data: { name: productName },
    });

    const subscription = await this.getClient().subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent as any;

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret ?? '',
    };
  }

  constructEvent(rawBody: Buffer, signature: string): any {
    return this.getClient().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
  }
}
