import { Injectable } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import { IProxyService, ProxyRequest } from './proxy.interface';

@Injectable()
export class WebappProxyService implements IProxyService {
  private readonly webappApiUrl: string;

  constructor() {
    this.webappApiUrl = process.env.WEBAPP_API_URL || 'http://cyna-webapp-api:3000';
  }

  async proxy(request: ProxyRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(request.path, this.webappApiUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const headers: any = { ...(request.headers || {}) };

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
        const chunks: Buffer[] = [];

        response.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk));
        });

        response.on('end', () => {
          const data = Buffer.concat(chunks);
          const contentType = response.headers['content-type'] || '';

          // Forward binary responses (PDF, etc.) as-is
          if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
            resolve({
              status: response.statusCode,
              data,
              headers: response.headers,
              binary: true,
            });
            return;
          }

          try {
            const parsed = JSON.parse(data.toString());
            resolve({
              status: response.statusCode,
              data: parsed,
              headers: response.headers,
            });
          } catch (error) {
            resolve({
              status: response.statusCode,
              data: data.toString(),
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
