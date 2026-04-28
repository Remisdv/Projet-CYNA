import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '../../database/entity/Order/CustomerOrder.entity';
import { SubscriptionPlan, SubscriptionStatus } from '../../database/entity/Subscription/WebappSubscription.entity';
import { WebappUserRepository } from '../../repository/WebappUser/WebappUser.repository';
import { CustomerOrderRepository } from '../../repository/Order/Order.repository';
import { SubscriptionRepository } from '../../repository/Subscription/Subscription.repository';
import { StripeService } from '../Stripe/Stripe.service';
import { CheckoutService } from '../Checkout/Checkout.service';
import { OrderSyncService } from '../Sync/OrderSync.service';
import { CreatePaymentIntentDto } from './dtos/Payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly userRepository: WebappUserRepository,
    private readonly orderRepository: CustomerOrderRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly stripeService: StripeService,
    private readonly checkoutService: CheckoutService,
    private readonly orderSyncService: OrderSyncService,
  ) { }

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Create or get Stripe customer
    if (!user.stripeCustomerId) {
      user.stripeCustomerId = await this.stripeService.createCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`,
      );
      await this.userRepository.save(user);
    }

    // Update user addresses if provided
    if (dto.billingAddress) user.billingAddress = dto.billingAddress;
    if (dto.shippingAddress) user.shippingAddress = dto.shippingAddress;
    await this.userRepository.save(user);

    // Separate items: products (one-time) vs services (subscriptions)
    const productItems = dto.items.filter((i) => i.productType === 'produit');
    const serviceItems = dto.items.filter((i) => i.productType === 'service');

    const results: any = { subscriptions: [] };

    // One-time payment for products
    if (productItems.length > 0) {
      const amount = productItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const { clientSecret, paymentIntentId } = await this.stripeService.createPaymentIntent(
        amount,
        'eur',
        user.stripeCustomerId,
        { userId, type: 'products' },
      );

      const orderItems = productItems.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productType: i.productType as 'produit',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.unitPrice * i.quantity,
      }));

      const order = this.orderRepository.create({
        ref: this.generateOrderRef(),
        userId,
        items: orderItems,
        amount,
        paymentIntentId,
        billingAddress: dto.billingAddress,
        shippingAddress: dto.shippingAddress,
      });
      await this.orderRepository.save(order);

      // Sync PENDING order to service-api so BO sees it immediately
      await this.orderSyncService.syncOrder(order, user);

      results.clientSecret = clientSecret;
      results.paymentIntentId = paymentIntentId;
      results.orderId = order.id;
      results.orderRef = order.ref;
      results.amount = amount;
    }

    // Subscriptions for services
    for (const item of serviceItems) {
      const interval = item.periodicity === 'annuel' ? 'year' : 'month';
      const { subscriptionId, clientSecret } = await this.stripeService.createSubscription(
        user.stripeCustomerId,
        item.unitPrice,
        interval as 'month' | 'year',
        item.productName,
        { userId, productId: item.productId },
      );

      const subscription = this.subscriptionRepository.create({
        userId,
        productId: item.productId,
        productName: item.productName,
        planType: item.periodicity === 'annuel' ? SubscriptionPlan.ANNUEL : SubscriptionPlan.MENSUEL,
        price: item.unitPrice,
        stripeSubscriptionId: subscriptionId,
        startDate: new Date(),
        renewalDate: new Date(Date.now() + (interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000),
      });
      await this.subscriptionRepository.save(subscription);

      // If no product items, also create an order for the service
      if (productItems.length === 0 && serviceItems.indexOf(item) === 0) {
        const orderItems = serviceItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          productType: i.productType as 'service',
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          periodicity: i.periodicity as 'mensuel' | 'annuel',
          subtotal: i.unitPrice * i.quantity,
        }));

        const totalAmount = serviceItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        const order = this.orderRepository.create({
          ref: this.generateOrderRef(),
          userId,
          items: orderItems,
          amount: totalAmount,
          billingAddress: dto.billingAddress,
          shippingAddress: dto.shippingAddress,
        });
        await this.orderRepository.save(order);

        // Sync PENDING order to service-api
        await this.orderSyncService.syncOrder(order, user);

        results.orderId = order.id;
        results.orderRef = order.ref;
        results.amount = totalAmount;
      }

      results.subscriptions.push({
        subscriptionId,
        clientSecret,
        productName: item.productName,
      });
    }

    return results;
  }

  async confirmOrder(userId: string, orderId: string): Promise<{ message: string }> {
    return this.checkoutService.confirmOrderByUserAndId(userId, orderId);
  }

  async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const order = await this.orderRepository.findByPaymentIntentId(paymentIntent.id);
        if (order) {
          await this.checkoutService.confirmOrder(order);
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(subscriptionId);
        if (subscription) {
          subscription.status = SubscriptionStatus.ACTIVE;
          await this.subscriptionRepository.save(subscription);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(sub.id);
        if (subscription) {
          subscription.status = SubscriptionStatus.EXPIRED;
          await this.subscriptionRepository.save(subscription);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const order = await this.orderRepository.findByPaymentIntentId(paymentIntent.id);
        if (order) {
          order.paymentStatus = PaymentStatus.FAILED;
          await this.orderRepository.save(order);
        }
        break;
      }
    }
  }

  private generateOrderRef(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CYNA-${year}-${random}`;
  }
}
