import {
  Controller,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BoProxyService } from '../service/bo-proxy.service';
import { Public } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/bo/health')
export class BoHealthProxyController extends BaseProxyController {
  constructor(readonly proxyService: BoProxyService) {
    super(proxyService);
  }

  @Get()
  @Public()
  async check(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/bo/health');
  }
}
