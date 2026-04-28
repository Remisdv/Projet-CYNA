import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Auth, Public } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/webapp')
export class WebappPaymentProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Post('payment-intents')
  @Auth()
  async createIntent(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/payment-intents');
  }

  @Post('payment-intents/confirmations')
  @Auth()
  async confirm(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/payment-intents/confirmations');
  }

  @Post('stripe-webhooks')
  @Public()
  async webhook(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/stripe-webhooks');
  }
}
