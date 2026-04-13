import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseProxyController } from './base-proxy.controller';
import { ProxyService } from '../service/proxy.service';
import { Public } from '../common';

@Controller('api/categories')
export class CategoriesPublicProxyController extends BaseProxyController {
  constructor(readonly proxyService: ProxyService) {
    super(proxyService);
  }

  @Get()
  @Public()
  async getAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/categories${qs}`);
  }

  @Get(':id')
  @Public()
  async getById(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/categories/${id}`);
  }
}
