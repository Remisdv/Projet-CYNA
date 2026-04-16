import { Controller, Get, Patch, Post, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseProxyController } from './base-proxy.controller';
import { ProxyService } from '../service/proxy.service';
import { Roles } from '../common';

@Controller('api/bo/orders')
export class OrdersProxyController extends BaseProxyController {
  constructor(readonly proxyService: ProxyService) {
    super(proxyService);
  }

  @Get()
  @Roles('admin')
  async findAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/orders${qs}`);
  }

  @Get(':id')
  @Roles('admin')
  async findById(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/orders/${id}`);
  }

  @Patch(':id/status')
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/orders/${id}/status`);
  }

  @Patch(':id/payment-status')
  @Roles('admin')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/orders/${id}/payment-status`);
  }

  @Post(':id/notes')
  @Roles('admin')
  async addNote(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/orders/${id}/notes`);
  }

  @Post(':id/credentials')
  @Roles('admin')
  async sendCredentials(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/orders/${id}/credentials`);
  }
}
