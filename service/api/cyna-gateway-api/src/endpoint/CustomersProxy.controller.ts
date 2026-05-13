import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Roles } from '../common';
import { BaseProxyController } from './base-proxy.controller';

/**
 * Proxy `/api/bo/customers` → cyna-webapp-api `/api/webapp/admin/users`.
 * All routes are guarded by `@Roles('admin')` so only authenticated BO
 * administrators can manage webapp customers.
 */
@Controller('api/bo/customers')
export class CustomersProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Get()
  @Roles('admin')
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('sort') sort?: string,
  ): Promise<void> {
    const qp = new URLSearchParams();
    if (page) qp.append('page', page);
    if (limit) qp.append('limit', limit);
    if (status) qp.append('status', status);
    if (search) qp.append('search', search);
    if (dateDebut) qp.append('dateDebut', dateDebut);
    if (dateFin) qp.append('dateFin', dateFin);
    if (sort) qp.append('sort', sort);
    const qs = qp.toString();
    const path = qs ? `/api/webapp/admin/users?${qs}` : '/api/webapp/admin/users';
    await this.proxy(req, res, path);
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    await this.proxy(req, res, `/api/webapp/admin/users/${id}`);
  }

  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response) {
    await this.proxy(req, res, '/api/webapp/admin/users');
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    await this.proxy(req, res, `/api/webapp/admin/users/${id}`);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    await this.proxy(req, res, `/api/webapp/admin/users/${id}`);
  }

  @Post(':id/reset-password')
  @Roles('admin')
  async resetPassword(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    await this.proxy(req, res, `/api/webapp/admin/users/${id}/reset-password`);
  }
}
