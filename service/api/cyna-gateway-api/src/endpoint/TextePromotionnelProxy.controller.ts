import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BoProxyService } from '../service/bo-proxy.service';
import { Public, Roles } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/bo/advertisements')
export class TextePromotionnelProxyController extends BaseProxyController {
  constructor(readonly proxyService: BoProxyService) {
    super(proxyService);
  }

  @Get()
  @Public()
  async getAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/bo/advertisements');
  }

  @Get('active')
  @Public()
  async getActive(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/bo/advertisements/active');
  }

  @Get(':id')
  @Public()
  async getById(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/advertisements/${id}`);
  }

  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/bo/advertisements');
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/advertisements/${id}`);
  }

  @Patch(':id/activate')
  @Roles('admin')
  async activate(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/advertisements/${id}/activate`);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/advertisements/${id}`);
  }
}