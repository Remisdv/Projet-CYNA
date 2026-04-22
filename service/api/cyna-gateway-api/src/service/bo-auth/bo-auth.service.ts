import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import { BoLoginDto, BoAuthResponseDto } from '../../dto/bo-auth/bo-auth.dto';

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

  async loginBo(loginDto: BoLoginDto): Promise<BoAuthResponseDto> {
    return this.callBoAuthEndpoint('/api/bo/auth/login', loginDto);
  }

  async refreshBo(refreshToken: string): Promise<BoAuthResponseDto> {
    return this.callBoAuthEndpoint('/api/bo/auth/refresh', { refresh_token: refreshToken });
  }

  async verifyTwoFactor(userId: string, code: string): Promise<any> {
    return this.callBoAuthEndpoint('/api/bo/auth/2fa/verify', { userId, code });
  }

  async resendTwoFactor(userId: string): Promise<any> {
    return this.callBoAuthEndpoint('/api/bo/auth/2fa/resend', { userId });
  }

  /**
   * Make HTTP request to BO service
   */
  private callBoAuthEndpoint(path: string, data: any): Promise<BoAuthResponseDto> {
    return new Promise((resolve, reject) => {
      const requestData = JSON.stringify(data);

      const options = {
        hostname: this.boApiHost,
        port: this.boApiPort,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData),
        },
      };

      const protocol = this.boApiUrl.startsWith('https') ? https : http;

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
                  'Invalid response from BO service',
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

      req.on('error', (error) => {
        reject(
          new HttpException(
            'Failed to connect to BO authentication service',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      });

      req.write(requestData);
      req.end();
    });
  }
}
