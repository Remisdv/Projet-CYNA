import {
  Controller,
  Get,
  Put,
  Patch,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Auth } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/webapp/account')
export class WebappAccountProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Get('profile')
  @Auth()
  async getProfile(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/account/profile');
  }

  @Put('profile')
  @Auth()
  async updateProfile(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/account/profile');
  }

  @Patch('password')
  @Auth()
  async changePassword(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/account/password');
  }
}
