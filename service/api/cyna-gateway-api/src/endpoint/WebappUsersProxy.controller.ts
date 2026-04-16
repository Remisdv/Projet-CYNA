import { Controller, Get, Req, Res, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Roles } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/bo/webapp-users')
export class WebappUsersProxyController extends BaseProxyController {
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
        @Query('sort') sort?: string,
    ): Promise<void> {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (sort) queryParams.append('sort', sort);

        const queryString = queryParams.toString();
        const path = queryString ? `/api/webapp/admin/users?${queryString}` : '/api/webapp/admin/users';
        await this.proxy(req, res, path);
    }
}
