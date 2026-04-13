import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseProxyController } from './base-proxy.controller';
import { ProxyService } from '../service/proxy.service';
import { Roles } from '../common';

@Controller('api/bo/stats')
export class StatsProxyController extends BaseProxyController {
  constructor(readonly proxyService: ProxyService) {
    super(proxyService);
  }

  @Get('dashboard')
  @Roles('admin')
  async getDashboard(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/stats/dashboard${qs}`);
  }

  @Get('commercial')
  @Roles('admin', 'commercial')
  async getCommercial(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/stats/commercial${qs}`);
  }
}
