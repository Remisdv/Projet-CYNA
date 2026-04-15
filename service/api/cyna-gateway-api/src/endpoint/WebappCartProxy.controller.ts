import { Controller, Get, Post, Put, Delete, Req, Res, Param } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Auth } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/webapp/cart')
export class WebappCartProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Get()
  @Auth()
  async getCart(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/cart');
  }

  @Post('items')
  @Auth()
  async addItem(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/cart/items');
  }

  @Put('items/:id')
  @Auth()
  async updateItem(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    await this.proxy(req, res, `/api/webapp/cart/items/${id}`);
  }

  @Delete('items/:id')
  @Auth()
  async removeItem(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    await this.proxy(req, res, `/api/webapp/cart/items/${id}`);
  }

  @Delete()
  @Auth()
  async clearCart(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/cart');
  }

  @Post('merge')
  @Auth()
  async mergeCart(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/cart/merge');
  }
}
