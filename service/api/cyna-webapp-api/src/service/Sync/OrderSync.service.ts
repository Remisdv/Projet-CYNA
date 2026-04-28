import { Injectable, Logger } from '@nestjs/common';
import { CustomerOrder } from '../../database/entity/Order/CustomerOrder.entity';
import { WebappUser } from '../../database/entity/WebappUser/WebappUser.entity';
import { HttpClientService } from '../../common/services/http-client.service';

@Injectable()
export class OrderSyncService {
    private readonly logger = new Logger(OrderSyncService.name);

    constructor(private readonly httpClient: HttpClientService) { }

    async syncOrder(order: CustomerOrder, user?: WebappUser): Promise<void> {
        try {
            await this.httpClient.post('/api/orders', {
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
            });
        } catch (err) {
            this.logger.error(`Failed to sync order to service-api: ${err?.message}`);
        }
    }
}
