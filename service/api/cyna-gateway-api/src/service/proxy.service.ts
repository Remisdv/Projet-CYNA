import { Injectable } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';

export interface ProxyRequest {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}

@Injectable()
export class ProxyService {
  private readonly serviceApiUrl: string;

  constructor() {
    this.serviceApiUrl = process.env.SERVICE_API_URL || 'http://cyna-service-api:3000';
  }

  /**
   * Proxy request to service API
   */
  async proxy(request: ProxyRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(request.path, this.serviceApiUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options: any = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers || {}),
        },
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

      if (request.body) {
        httpRequest.write(JSON.stringify(request.body));
      }

      httpRequest.end();
    });
  }
}
