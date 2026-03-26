import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BoProxyService } from '../service/bo-proxy.service';
import { Public, Roles } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/bo/faqs')
export class FaqProxyController extends BaseProxyController {
  constructor(readonly proxyService: BoProxyService) {
    super(proxyService);
  }

  @Get('tree')
  @Public()
  async getTree(@Req() req: Request, @Res() res: Response): Promise<void> {
    const lang = (req.query.lang as string) || '';
    const path = lang ? `/api/bo/faqs/tree?lang=${encodeURIComponent(lang)}` : '/api/bo/faqs/tree';
    await this.proxy(req, res, path);
  }

  @Get(':id')
  @Public()
  async getById(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/faqs/${id}`);
  }

  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/bo/faqs');
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/faqs/${id}`);
  }

  @Put(':id/reorder')
  @Roles('admin')
  async reorder(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/faqs/${id}/reorder`);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/faqs/${id}`);
  }
}
