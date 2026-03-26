import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Req,
  Res,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BoProxyService } from '../service/bo-proxy.service';
import { Roles } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/bo/users')
export class UserProxyController extends BaseProxyController {
  constructor(readonly proxyService: BoProxyService) {
    super(proxyService);
  }

  @Get()
  @Roles('admin')
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('sort') sort?: string,
  ): Promise<void> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);
    if (dateDebut) queryParams.append('dateDebut', dateDebut);
    if (dateFin) queryParams.append('dateFin', dateFin);
    if (sort) queryParams.append('sort', sort);

    const queryString = queryParams.toString();
    const path = queryString ? `/api/bo/users?${queryString}` : '/api/bo/users';
    await this.proxy(req, res, path);
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/users/${id}`);
  }

  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/bo/users');
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/users/${id}`);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/users/${id}`);
  }

  @Post(':id/reset-password')
  @Roles('admin')
  async resetPassword(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/bo/users/${id}/reset-password`);
  }
}
