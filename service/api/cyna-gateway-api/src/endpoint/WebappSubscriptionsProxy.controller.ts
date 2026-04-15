import {
  Controller,
  Get,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Auth } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/webapp/subscriptions')
export class WebappSubscriptionsProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Get()
  @Auth()
  async getAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/subscriptions');
  }

  @Get(':id')
  @Auth()
  async getOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/webapp/subscriptions/${id}`);
  }
}
