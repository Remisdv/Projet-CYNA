import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { Auth } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/webapp/account/two-factor-methods')
export class WebappTwoFactorProxyController extends BaseProxyController {
  constructor(readonly proxyService: WebappProxyService) {
    super(proxyService);
  }

  @Get()
  @Auth()
  async list(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/account/two-factor-methods');
  }

  @Post()
  @Auth()
  async enable(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/webapp/account/two-factor-methods');
  }

  @Patch(':type')
  @Auth()
  async confirm(
    @Param('type') type: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/webapp/account/two-factor-methods/${encodeURIComponent(type)}`);
  }

  @Delete(':type')
  @Auth()
  async disable(
    @Param('type') type: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/webapp/account/two-factor-methods/${encodeURIComponent(type)}`);
  }

  @Post(':type/challenges')
  @Auth()
  async challenge(
    @Param('type') type: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/webapp/account/two-factor-methods/${encodeURIComponent(type)}/challenges`);
  }
}
