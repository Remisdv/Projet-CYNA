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

  async verifyTwoFactor(userId: string, code: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/2fa/verify', { userId, code });
  }

  async resendTwoFactor(userId: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/2fa/resend', { userId });
  }

  async enableEmailTwoFactor(userId: string, password: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/2fa/email/enable', { userId, password });
  }

  async confirmEmailTwoFactor(userId: string, password: string, code: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/2fa/email/enable/confirm', { userId, password, code });
  }

  async setupTotp(userId: string, password: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/2fa/totp/setup', { userId, password });
  }

  async confirmTotp(userId: string, password: string, code: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/2fa/totp/confirm', { userId, password, code });
  }

  async sendDisableCode(userId: string, password: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/2fa/disable/send-code', { userId, password });
  }

  async disableTwoFactor(userId: string, password: string, code: string): Promise<any> {
    return this.callWebappAuthEndpoint('/api/webapp/auth/2fa/disable', { userId, password, code });
  }

  async getTwoFactorStatus(userId: string): Promise<any> {
    return this.callWebappAuthGetEndpoint(`/api/webapp/auth/2fa/status?userId=${encodeURIComponent(userId)}`);
  }

  private callWebappAuthGetEndpoint(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.webappApiHost,
        port: this.webappApiPort,
        path,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };

      const protocol = this.webappApiUrl.startsWith('https') ? https : http;

      const req = protocol.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(JSON.parse(responseData)); } catch {
              reject(new HttpException('Invalid response from webapp service', HttpStatus.INTERNAL_SERVER_ERROR));
            }
          } else {
            try {
              const error = JSON.parse(responseData);
              reject(new HttpException(error.message || 'Service error', res.statusCode || HttpStatus.INTERNAL_SERVER_ERROR));
            } catch {
              reject(new HttpException('Service error', res.statusCode || HttpStatus.INTERNAL_SERVER_ERROR));
            }
          }
        });
      });

      req.on('error', () => {
        reject(new HttpException('Failed to connect to webapp service', HttpStatus.INTERNAL_SERVER_ERROR));
      });

      req.end();
    });
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
