import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Auth, Public } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/webapp/payment')
export class WebappPaymentProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Post('create-intent')
  @Auth()
  async createIntent(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/payment/create-intent');
  }

  @Post('stripe/webhook')
  @Public()
  async webhook(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/payment/stripe/webhook');
  }
}
