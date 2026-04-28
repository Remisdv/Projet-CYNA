import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerOrder, OrderStatus, PaymentStatus } from '../../database/entity/Order/CustomerOrder.entity';
import { WebappUser } from '../../database/entity/WebappUser/WebappUser.entity';
import { CustomerOrderRepository } from '../../repository/Order/Order.repository';
import { WebappUserRepository } from '../../repository/WebappUser/WebappUser.repository';
import { EmailService } from '../Email/Email.service';
import { InvoiceService } from '../Invoice/Invoice.service';
import { CartService } from '../Cart/Cart.service';
import { OrderSyncService } from '../Sync/OrderSync.service';

@Injectable()
export class CheckoutService {
    constructor(
        private readonly orderRepository: CustomerOrderRepository,
        private readonly userRepository: WebappUserRepository,
        private readonly emailService: EmailService,
        private readonly invoiceService: InvoiceService,
        private readonly cartService: CartService,
        private readonly orderSyncService: OrderSyncService,
    ) { }

    /**
     * Confirms an order after payment: updates status, sends email with invoice,
     * sends service credentials, clears cart, and syncs to service-api.
     */
    async confirmOrder(order: CustomerOrder): Promise<void> {
        // Skip if already confirmed
        if (order.status === OrderStatus.CONFIRMED && order.paymentStatus === PaymentStatus.PAID) {
            return;
        }

        order.paymentStatus = PaymentStatus.PAID;
        order.status = OrderStatus.CONFIRMED;
        await this.orderRepository.save(order);

        const user = await this.userRepository.findById(order.userId);
        if (user) {
            await this.sendConfirmationEmail(order, user);
            await this.sendServiceCredentials(order, user);
            await this.cartService.markPurchased(order.userId);
        }

        await this.orderSyncService.syncOrder(order, user);
    }

    async confirmOrderByUserAndId(userId: string, orderId: string): Promise<{ message: string }> {
        const order = await this.orderRepository.findByIdAndUser(orderId, userId);
        if (!order) throw new NotFoundException('Commande introuvable');

        if (order.status === OrderStatus.CONFIRMED && order.paymentStatus === PaymentStatus.PAID) {
            return { message: `Commande ${order.ref} déjà confirmée` };
        }

        await this.confirmOrder(order);
        return { message: `Commande ${order.ref} confirmée` };
    }

    private async sendConfirmationEmail(order: CustomerOrder, user: WebappUser): Promise<void> {
        try {
            const invoicePdf = await this.invoiceService.generateInvoicePdf(order.id, order.userId);
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
    }

    private async sendServiceCredentials(order: CustomerOrder, user: WebappUser): Promise<void> {
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
    }
}
