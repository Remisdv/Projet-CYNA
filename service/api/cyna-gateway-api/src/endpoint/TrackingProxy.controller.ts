import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseProxyController } from './base-proxy.controller';
import { ProxyService } from '../service/proxy.service';
import { Public } from '../common';

@Controller('api/tracking')
export class TrackingProxyController extends BaseProxyController {
    constructor(readonly proxyService: ProxyService) {
        super(proxyService);
    }

    @Post('event')
    @Public()
    async trackEvent(@Req() req: Request, @Res() res: Response): Promise<void> {
        await this.proxy(req, res, '/api/tracking/event');
    }
}
