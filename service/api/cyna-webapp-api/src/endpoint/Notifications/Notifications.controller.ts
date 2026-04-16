import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '../../service/Email/Email.service';

@Controller('internal/notifications')
export class NotificationsController {
    constructor(private readonly emailService: EmailService) { }

    @Post('shipping-update')
    async sendShippingUpdate(
        @Body()
        body: {
            email: string;
            ref: string;
            trackingNumber?: string;
            status: string;
        },
    ) {
        await this.emailService.sendShippingUpdate(body.email, {
            ref: body.ref,
            trackingNumber: body.trackingNumber,
            status: body.status,
        });
        return { sent: true };
    }

    @Post('service-credentials')
    async sendServiceCredentials(
        @Body()
        body: {
            email: string;
            ref: string;
            serviceName: string;
        },
    ) {
        // Mocked credentials
        const credentials = {
            login: body.email,
            password: `CYNA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            url: `https://app.cyna.com/services/access`,
        };

        await this.emailService.sendServiceCredentials(body.email, {
            ref: body.ref,
            serviceName: body.serviceName,
            credentials,
        });
        return { sent: true };
    }
}
