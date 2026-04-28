import {
  Controller,
  Get,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { ProxyService } from '../service/proxy.service';
import { Auth } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/webapp/orders')
export class WebappOrdersProxyController extends BaseProxyController {
  constructor(
    readonly proxyService: WebappProxyService,
    private readonly serviceApiProxy: ProxyService,
  ) {
    super(proxyService);
  }

  @Get()
  @Auth()
  async getAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/webapp/orders${query}`);
  }

  @Get(':id')
  @Auth()
  async getOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/webapp/orders/${id}`);
  }

  @Get(':id/tracking')
  @Auth()
  async getTracking(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const webappOrder = await this.proxyService.proxy({
        method: 'GET',
        path: `/api/webapp/orders/${id}`,
        headers: {
          'x-user-id': (req as any).user?.sub ? String((req as any).user.sub) : '',
        },
      });
      const ref = webappOrder?.data?.ref;
      if (!ref) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }
      const serviceOrder = await this.serviceApiProxy.proxy({
        method: 'GET',
        path: `/api/orders?ref=${encodeURIComponent(ref)}`,
        headers: {},
      });
      const orders = serviceOrder?.data;
      const so = Array.isArray(orders) ? orders[0] : orders;
      res.json({
        trackingNumber: so?.trackingNumber || webappOrder?.data?.trackingNumber || null,
        credentials: so?.credentials || [],
        status: so?.status || webappOrder?.data?.status,
        shippedAt: so?.shippedAt || null,
        history: so?.history || [],
      });
    } catch {
      res.status(500).json({ message: 'Failed to fetch tracking data' });
    }
  }

  @Get(':id/invoice')
  @Auth()
  async getInvoice(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/webapp/orders/${id}/invoice`);
  }
}
