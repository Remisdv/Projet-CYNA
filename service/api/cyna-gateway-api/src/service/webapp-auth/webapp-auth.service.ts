import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import { WebappAuthResponseDto, WebappRegisterDto } from '../../dto/webapp-auth/webapp-auth.dto';

type HttpMethod = 'POST' | 'PATCH' | 'DELETE' | 'GET';

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

  /** POST /auth/users — register. */
  async register(dto: WebappRegisterDto): Promise<WebappAuthResponseDto> {
    return this.call('POST', '/api/webapp/auth/users', dto);
  }

  /** POST /auth/sessions — login or refresh depending on body shape. */
  async createSession(body: { email?: string; password?: string; refresh_token?: string }): Promise<WebappAuthResponseDto> {
    return this.call('POST', '/api/webapp/auth/sessions', body);
  }

  /** PATCH /auth/sessions/current — confirm 2FA code. */
  async verifySession(userId: string, code: string): Promise<WebappAuthResponseDto> {
    return this.call('PATCH', '/api/webapp/auth/sessions/current', { userId, code });
  }

  /** POST /auth/sessions/current/two-factor-challenges — resend 2FA code. */
  async createTwoFactorChallenge(userId: string): Promise<{ message: string }> {
    return this.call('POST', '/api/webapp/auth/sessions/current/two-factor-challenges', { userId });
  }

  /** POST /auth/password-resets — request password reset email. */
  async requestPasswordReset(email: string): Promise<any> {
    return this.call('POST', '/api/webapp/auth/password-resets', { email });
  }

  /** PATCH /auth/password-resets/:token — confirm a password reset. */
  async confirmPasswordReset(token: string, newPassword: string): Promise<any> {
    return this.call('PATCH', `/api/webapp/auth/password-resets/${encodeURIComponent(token)}`, { newPassword });
  }

  private call(method: HttpMethod, path: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestData = data !== undefined ? JSON.stringify(data) : '';

      const headers: Record<string, string | number> = {
        'Content-Type': 'application/json',
      };
      if (requestData) headers['Content-Length'] = Buffer.byteLength(requestData);

      const options = {
        hostname: this.webappApiHost,
        port: this.webappApiPort,
        path,
        method,
        headers,
      };

      const protocol = this.webappApiUrl.startsWith('https') ? https : http;

      const req = protocol.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          if (res.statusCode! >= 200 && res.statusCode! < 300) {
            try {
              resolve(responseData ? JSON.parse(responseData) : {});
            } catch {
              reject(new HttpException('Invalid response from webapp service', HttpStatus.INTERNAL_SERVER_ERROR));
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
        reject(new HttpException('Failed to connect to webapp authentication service', HttpStatus.INTERNAL_SERVER_ERROR));
      });

      if (requestData) req.write(requestData);
      req.end();
    });
  }
}
