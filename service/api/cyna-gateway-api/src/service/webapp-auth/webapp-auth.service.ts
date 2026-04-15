import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import {
  WebappLoginDto,
  WebappRegisterDto,
  WebappAuthResponseDto,
} from '../../dto/webapp-auth/webapp-auth.dto';

@Injectable()
export class WebappAuthService {
  private webappApiUrl: string;
  private webappApiHost: string;
  private webappApiPort: number;

  constructor() {
    this.webappApiUrl = process.env.WEBAPP_API_URL || 'http://cyna-webapp-api:3000';
    const url = new URL(this.webappApiUrl);
    this.webappApiHost = url.hostname;
    this.webappApiPort = parseInt(url.port || '3000', 10);
  }

  async register(dto: WebappRegisterDto): Promise<WebappAuthResponseDto> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/register', dto);
  }

  async login(dto: WebappLoginDto): Promise<WebappAuthResponseDto> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/login', dto);
  }

  async refresh(refreshToken: string): Promise<WebappAuthResponseDto> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/refresh', { refresh_token: refreshToken });
  }

  async forgotPassword(email: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/reset-password', { token, newPassword });
  }

  private callWebappAuthEndpoint(path: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestData = JSON.stringify(data);

      const options = {
        hostname: this.webappApiHost,
        port: this.webappApiPort,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData),
        },
      };

      const protocol = this.webappApiUrl.startsWith('https') ? https : http;

      const req = protocol.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch (error) {
              reject(
                new HttpException(
                  'Invalid response from webapp service',
                  HttpStatus.INTERNAL_SERVER_ERROR,
                ),
              );
            }
          } else {
            try {
              const error = JSON.parse(responseData);
              reject(
                new HttpException(
                  error.message || 'Authentication failed',
                  res.statusCode || HttpStatus.UNAUTHORIZED,
                ),
              );
            } catch (parseError) {
              reject(
                new HttpException(
                  'Authentication service error',
                  res.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
                ),
              );
            }
          }
        });
      });

      req.on('error', () => {
        reject(
          new HttpException(
            'Failed to connect to webapp authentication service',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      });

      req.write(requestData);
      req.end();
    });
  }
}
