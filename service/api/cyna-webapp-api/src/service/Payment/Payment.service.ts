import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebappUser } from '../../database/entity/WebappUser/WebappUser.entity';
import { CustomerOrder, OrderStatus, PaymentStatus } from '../../database/entity/Order/CustomerOrder.entity';
import { WebappSubscription, SubscriptionPlan, SubscriptionStatus } from '../../database/entity/Subscription/WebappSubscription.entity';
import { StripeService } from '../Stripe/Stripe.service';
import { EmailService } from '../Email/Email.service';
import { CartService } from '../Cart/Cart.service';
import { OrderService } from '../Order/Order.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from '../dtos/Payment/Payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(WebappUser)
    private readonly userRepo: Repository<WebappUser>,
    @InjectRepository(CustomerOrder)
    private readonly orderRepo: Repository<CustomerOrder>,
    @InjectRepository(WebappSubscription)
    private readonly subscriptionRepo: Repository<WebappSubscription>,
    private readonly stripeService: StripeService,
    private readonly emailService: EmailService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) { }

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Create or get Stripe customer
    if (!user.stripeCustomerId) {
      user.stripeCustomerId = await this.stripeService.createCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`,
      );
      await this.userRepo.save(user);
    }

    // Update user addresses if provided
    if (dto.billingAddress) user.billingAddress = dto.billingAddress;
    if (dto.shippingAddress) user.shippingAddress = dto.shippingAddress;
    await this.userRepo.save(user);

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

      // Create pending order
      const orderItems = productItems.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productType: i.productType as 'produit',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.unitPrice * i.quantity,
      }));

      const order = this.orderRepo.create({
        ref: this.generateOrderRef(),
        userId,
        items: orderItems,
        amount,
        paymentIntentId,
        billingAddress: dto.billingAddress,
        shippingAddress: dto.shippingAddress,
      });
      await this.orderRepo.save(order);

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

      const subscription = this.subscriptionRepo.create({
        userId,
        productId: item.productId,
        productName: item.productName,
        planType: item.periodicity === 'annuel' ? SubscriptionPlan.ANNUEL : SubscriptionPlan.MENSUEL,
        price: item.unitPrice,
        stripeSubscriptionId: subscriptionId,
        startDate: new Date(),
        renewalDate: new Date(Date.now() + (interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000),
      });
      await this.subscriptionRepo.save(subscription);

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
        const order = this.orderRepo.create({
          ref: this.generateOrderRef(),
          userId,
          items: orderItems,
          amount: totalAmount,
          billingAddress: dto.billingAddress,
          shippingAddress: dto.shippingAddress,
        });
        await this.orderRepo.save(order);
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
    const order = await this.orderRepo.findOneBy({ id: orderId, userId });
    if (!order) throw new NotFoundException('Commande introuvable');

    // Skip if already confirmed
    if (order.status === OrderStatus.CONFIRMED && order.paymentStatus === PaymentStatus.PAID) {
      return { message: `Commande ${order.ref} déjà confirmée` };
    }

    order.paymentStatus = PaymentStatus.PAID;
    order.status = OrderStatus.CONFIRMED;
    await this.orderRepo.save(order);

    const user = await this.userRepo.findOneBy({ id: userId });
    if (user) {
      // Send confirmation email with invoice PDF
      try {
        const invoicePdf = await this.orderService.generateInvoicePdf(order.id, order.userId);
        await this.emailService.sendOrderConfirmationWithInvoice(user.email, {
          ref: order.ref,
          amount: Number(order.amount),
          items: order.items,
        }, invoicePdf);
      } catch {
        await this.emailService.sendOrderConfirmation(user.email, {
          ref: order.ref,
          amount: Number(order.amount),
          items: order.items,
        });
      }

      // Send service credentials (mocked)
      const serviceItems = order.items.filter((i: any) => i.productType === 'service');
      for (const item of serviceItems) {
        await this.emailService.sendServiceCredentials(user.email, {
          ref: order.ref,
          serviceName: item.productName,
          credentials: {
            login: user.email,
            password: `CYNA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            url: `https://app.cyna.com/services/${item.productId || 'default'}`,
          },
        });
      }

      // Clear cart
      await this.cartService.markPurchased(order.userId);
    }

    // Sync order to service-api for BO visibility
    await this.syncOrderToServiceApi(order, user);

    return { message: `Commande ${order.ref} confirmée` };
  }

  async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const order = await this.orderRepo.findOneBy({ paymentIntentId: paymentIntent.id });
        if (order) {
          order.paymentStatus = PaymentStatus.PAID;
          order.status = OrderStatus.CONFIRMED;
          await this.orderRepo.save(order);

          const user = await this.userRepo.findOneBy({ id: order.userId });
          if (user) {
            // Generate invoice PDF and send confirmation with attachment
            try {
              const invoicePdf = await this.orderService.generateInvoicePdf(order.id, order.userId);
              await this.emailService.sendOrderConfirmationWithInvoice(user.email, {
                ref: order.ref,
                amount: Number(order.amount),
                items: order.items,
              }, invoicePdf);
            } catch {
              // Fallback to simple confirmation if PDF generation fails
              await this.emailService.sendOrderConfirmation(user.email, {
                ref: order.ref,
                amount: Number(order.amount),
                items: order.items,
              });
            }

            // Send service credentials for service items (mocked)
            const serviceItems = order.items.filter(
              (i: any) => i.productType === 'service',
            );
            for (const item of serviceItems) {
              await this.emailService.sendServiceCredentials(user.email, {
                ref: order.ref,
                serviceName: item.productName,
                credentials: {
                  login: user.email,
                  password: `CYNA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                  url: `https://app.cyna.com/services/${item.productId || 'default'}`,
                },
              });
            }

            // Clear cart without releasing stock (items are purchased)
            await this.cartService.markPurchased(order.userId);

            // Sync order to service-api for BO
            await this.syncOrderToServiceApi(order, user);
          }
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const subscription = await this.subscriptionRepo.findOneBy({ stripeSubscriptionId: subscriptionId });
        if (subscription) {
          subscription.status = SubscriptionStatus.ACTIVE;
          await this.subscriptionRepo.save(subscription);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const subscription = await this.subscriptionRepo.findOneBy({ stripeSubscriptionId: sub.id });
        if (subscription) {
          subscription.status = SubscriptionStatus.EXPIRED;
          await this.subscriptionRepo.save(subscription);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const order = await this.orderRepo.findOneBy({ paymentIntentId: paymentIntent.id });
        if (order) {
          order.paymentStatus = PaymentStatus.FAILED;
          await this.orderRepo.save(order);
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

  private async syncOrderToServiceApi(order: CustomerOrder, user?: WebappUser): Promise<void> {
    try {
      const axios = require('axios');
      await axios.post(
        `${process.env.SERVICE_API_URL || 'http://cyna-service-api:3000'}/api/orders/sync`,
        {
          ref: order.ref,
          clientEmail: user?.email || 'unknown',
          clientFirstName: user?.firstName,
          clientLastName: user?.lastName,
          items: order.items,
          amount: Number(order.amount),
          status: order.status,
          paymentStatus: order.paymentStatus,
          billingAddress: order.billingAddress,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
        },
      );
    } catch (err) {
      console.error('Failed to sync order to service-api:', err?.message);
    }
  }
}
