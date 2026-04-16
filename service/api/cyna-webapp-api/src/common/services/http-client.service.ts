import { Injectable, Logger } from '@nestjs/common';
import * as http from 'http';

@Injectable()
export class HttpClientService {
    private readonly logger = new Logger(HttpClientService.name);
    private readonly serviceApiUrl: string;

    constructor() {
        this.serviceApiUrl = process.env.SERVICE_API_URL || 'http://cyna-service-api:3000';
    }

    async request<T = any>(method: string, path: string, body?: any): Promise<T | null> {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.serviceApiUrl);
            const headers: Record<string, string> = {};
            let bodyStr: string | undefined;

            if (body) {
                bodyStr = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
                headers['Content-Length'] = Buffer.byteLength(bodyStr).toString();
            }

            const req = http.request(
                {
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname,
                    method,
                    headers,
                },
                (res) => {
                    const chunks: Buffer[] = [];
                    res.on('data', (c) => chunks.push(c));
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(Buffer.concat(chunks).toString()));
                        } catch {
                            resolve(null);
                        }
                    });
                },
            );

            req.on('error', (err) => {
                this.logger.error(`HTTP ${method} ${path} failed: ${err.message}`);
                reject(err);
            });

            if (bodyStr) req.write(bodyStr);
            req.end();
        });
    }

    async get<T = any>(path: string): Promise<T | null> {
        return this.request<T>('GET', path);
    }

    async post<T = any>(path: string, body?: any): Promise<T | null> {
        return this.request<T>('POST', path, body);
    }

    async put<T = any>(path: string, body?: any): Promise<T | null> {
        return this.request<T>('PUT', path, body);
    }
}
