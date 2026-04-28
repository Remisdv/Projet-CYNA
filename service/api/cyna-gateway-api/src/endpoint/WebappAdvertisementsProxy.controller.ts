import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Public } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/webapp/advertisements')
export class WebappAdvertisementsProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Get()
  @Public()
  async getAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/webapp/advertisements${qs}`);
  }
}
