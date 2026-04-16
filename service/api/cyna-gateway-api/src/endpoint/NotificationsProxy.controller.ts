import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseProxyController } from './base-proxy.controller';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Roles } from '../common';

@Controller('api/bo/notifications')
export class NotificationsProxyController extends BaseProxyController {
    constructor(readonly webappProxyService: WebappProxyService) {
        super(webappProxyService);
    }

    @Post('shipping-update')
    @Roles('admin')
    async sendShippingUpdate(
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        await this.proxy(req, res, '/api/internal/notifications/shipping-update');
    }

    @Post('service-credentials')
    @Roles('admin')
    async sendServiceCredentials(
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        await this.proxy(req, res, '/api/internal/notifications/service-credentials');
    }
}
