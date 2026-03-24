import { Request, Response } from 'express';
import { IProxyService } from '../service/proxy.interface';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

export abstract class BaseProxyController {
  constructor(protected readonly proxyService: IProxyService) {}

  protected async proxy(req: Request, res: Response, path: string): Promise<void> {
    try {
      const headers: Record<string, string> = {};
      ['authorization', 'content-type', 'x-request-id', 'x-correlation-id'].forEach((h) => {
        if (req.headers[h]) headers[h] = String(req.headers[h]);
      });

      const proxyResponse = await this.proxyService.proxy({
        method: req.method,
        path,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      });

      if (proxyResponse.data === '' || proxyResponse.data === null || proxyResponse.data === undefined) {
        res.status(proxyResponse.status).send();
      } else {
        res.status(proxyResponse.status).json(proxyResponse.data);
      }
    } catch (error) {
      console.error('Proxy error:', error);
      throw new HttpException('Service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}