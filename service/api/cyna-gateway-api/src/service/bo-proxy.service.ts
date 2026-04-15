import { Injectable } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import { IProxyService, ProxyRequest } from './proxy.interface';

@Injectable()
export class BoProxyService implements IProxyService {
  private readonly boApiUrl: string;

  constructor() {
    this.boApiUrl = process.env.BO_API_URL || 'http://cyna-bo-api:3000';
  }

  /**
   * Proxy request to Back-Office API
   */
  async proxy(request: ProxyRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(request.path, this.boApiUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const headers: any = { ...(request.headers || {}) };

      // Only add Content-Type/body for requests that actually have a non-empty body.
      // Express sets req.body = {} by default; an empty object must not be forwarded
      // because APIs with forbidNonWhitelisted:true reject unexpected bodies.
      const hasBody =
        request.body !== undefined &&
        request.body !== null &&
        !(typeof request.body === 'object' && Object.keys(request.body).length === 0);

      if (hasBody && request.method !== 'GET' && request.method !== 'HEAD') {
        headers['Content-Type'] = 'application/json';
      }

      const options: any = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: request.method,
        headers,
      };

      const httpRequest = client.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              status: response.statusCode,
              data: parsed,
              headers: response.headers,
            });
          } catch (error) {
            resolve({
              status: response.statusCode,
              data: data,
              headers: response.headers,
            });
          }
        });
      });

      httpRequest.on('error', reject);

      if (hasBody && request.method !== 'GET' && request.method !== 'HEAD') {
        httpRequest.write(JSON.stringify(request.body));
      }

      httpRequest.end();
    });
  }
}
