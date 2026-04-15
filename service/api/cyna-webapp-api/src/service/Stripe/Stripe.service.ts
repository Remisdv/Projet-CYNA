import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: InstanceType<typeof Stripe>;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({ email, name });
    return customer.id;
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    metadata: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const intent = await this.stripe.paymentIntents.create({
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
    const price = await this.stripe.prices.create({
      unit_amount: Math.round(priceAmount * 100),
      currency: 'eur',
      recurring: { interval },
      product_data: { name: productName },
    });

    const subscription = await this.stripe.subscriptions.create({
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
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
  }
}
