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

      // Forward authenticated user ID to downstream services
      const user = (req as any).user;
      if (user?.sub) {
        headers['x-user-id'] = String(user.sub);
      }

      const proxyResponse = await this.proxyService.proxy({
        method: req.method,
        path,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      });

      // Handle binary responses (PDF, etc.)
      if (proxyResponse.binary && Buffer.isBuffer(proxyResponse.data)) {
        const proxyHeaders = proxyResponse.headers || {};
        if (proxyHeaders['content-type']) res.set('Content-Type', proxyHeaders['content-type']);
        if (proxyHeaders['content-disposition']) res.set('Content-Disposition', proxyHeaders['content-disposition']);
        res.status(proxyResponse.status).end(proxyResponse.data);
        return;
      }

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