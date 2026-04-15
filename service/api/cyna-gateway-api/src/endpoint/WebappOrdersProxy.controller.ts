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

@Controller('api/webapp/orders')
export class WebappOrdersProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Get()
  @Auth()
  async getAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/webapp/orders${query}`);
  }

  @Get(':id')
  @Auth()
  async getOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/webapp/orders/${id}`);
  }

  @Get(':id/invoice')
  @Auth()
  async getInvoice(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/webapp/orders/${id}/invoice`);
  }
}
