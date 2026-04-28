import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import { BoAuthResponseDto } from '../../dto/bo-auth/bo-auth.dto';

type HttpMethod = 'POST' | 'PATCH' | 'DELETE' | 'GET';

@Injectable()
export class BoAuthService {
  private boApiUrl: string;
  private boApiHost: string;
  private boApiPort: number;

  constructor() {
    this.boApiUrl = process.env.BO_API_URL || 'http://localhost:3001';
    this.boApiHost = process.env.BO_API_HOST || 'localhost';
    this.boApiPort = parseInt(process.env.BO_API_PORT || '3001', 10);
  }

  /** POST /auth/sessions — login or refresh depending on body shape. */
  async createSession(body: { email?: string; password?: string; refresh_token?: string }): Promise<BoAuthResponseDto> {
    return this.call('POST', '/api/bo/auth/sessions', body);
  }

  /** PATCH /auth/sessions/current — confirm 2FA code. */
  async verifySession(userId: string, code: string): Promise<BoAuthResponseDto> {
    return this.call('PATCH', '/api/bo/auth/sessions/current', { userId, code });
  }

  /** POST /auth/sessions/current/two-factor-challenges — resend 2FA code. */
  async createTwoFactorChallenge(userId: string): Promise<{ message: string }> {
    return this.call('POST', '/api/bo/auth/sessions/current/two-factor-challenges', { userId });
  }

  private call(method: HttpMethod, path: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestData = data !== undefined ? JSON.stringify(data) : '';

      const headers: Record<string, string | number> = {
        'Content-Type': 'application/json',
      };
      if (requestData) headers['Content-Length'] = Buffer.byteLength(requestData);

      const options = {
        hostname: this.boApiHost,
        port: this.boApiPort,
        path,
        method,
        headers,
      };

      const protocol = this.boApiUrl.startsWith('https') ? https : http;

      const req = protocol.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          if (res.statusCode! >= 200 && res.statusCode! < 300) {
            try {
              resolve(responseData ? JSON.parse(responseData) : {});
            } catch {
              reject(new HttpException('Invalid response from BO service', HttpStatus.INTERNAL_SERVER_ERROR));
            }
          } else {
            try {
              const error = JSON.parse(responseData);
              reject(new HttpException(error.message || 'Authentication failed', res.statusCode || HttpStatus.UNAUTHORIZED));
            } catch {
              reject(new HttpException('Authentication service error', res.statusCode || HttpStatus.INTERNAL_SERVER_ERROR));
            }
          }
        });
      });

      req.on('error', () => {
        reject(new HttpException('Failed to connect to BO authentication service', HttpStatus.INTERNAL_SERVER_ERROR));
      });

      if (requestData) req.write(requestData);
      req.end();
    });
  }
}
