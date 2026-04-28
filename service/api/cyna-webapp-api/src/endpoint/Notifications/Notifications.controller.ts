import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '../../service/Email/Email.service';
import { ShippingUpdateDto, ServiceCredentialsDto } from '../../service/Notifications/dtos/Notification.dto';

@Controller('internal/notifications')
export class NotificationsController {
    constructor(private readonly emailService: EmailService) { }

    @Post('shipping-update')
    async sendShippingUpdate(@Body() dto: ShippingUpdateDto) {
        await this.emailService.sendShippingUpdate(dto.email, {
            ref: dto.ref,
            trackingNumber: dto.trackingNumber,
            status: dto.status,
        });
        return { sent: true };
    }

    @Post('service-credentials')
    async sendServiceCredentials(@Body() dto: ServiceCredentialsDto) {
        const credentials = {
            login: dto.email,
            password: `CYNA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            url: `https://app.cyna.com/services/access`,
        };

        await this.emailService.sendServiceCredentials(dto.email, {
            ref: dto.ref,
            serviceName: dto.serviceName,
            credentials,
        });
        return { sent: true };
    }
}
