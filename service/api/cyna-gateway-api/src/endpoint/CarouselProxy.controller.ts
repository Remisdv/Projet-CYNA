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

@Controller('api/bo/carousel')
export class CarouselProxyController extends BaseProxyController {
  constructor(readonly proxyService: BoProxyService) {
    super(proxyService);
  }

  @Get()
  @Public()
  async getAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/bo/carousel');
  }

  @Get(':id')
  @Public()
  async getById(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/carousel/${id}`);
  }

  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/bo/carousel');
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/carousel/${id}`);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/carousel/${id}`);
  }
}
