import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logLevel: string;
  private readonly enableColors: boolean;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.enableColors = process.env.LOG_COLORS !== 'false';
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const requestId = (req as any).requestId;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const logMessage = this.formatLog({
        timestamp: new Date().toISOString(),
        requestId,
        method,
        url: originalUrl,
        statusCode,
        duration,
        ip: ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      if (this.shouldLog(statusCode)) {
        console.log(logMessage);
      }
    });

    next();
  }

  private formatLog(data: {
    timestamp: string;
    requestId?: string;
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    ip: string | string[];
    userAgent: string;
  }): string {
    const statusColor = this.getStatusColor(data.statusCode);
    const resetColor = this.enableColors ? '\x1b[0m' : '';

    const status = this.enableColors
      ? `${statusColor}${data.statusCode}${resetColor}`
      : `${data.statusCode}`;
    
    const reqIdInfo = data.requestId ? `[${data.requestId}] ` : '';

    return `[${data.timestamp}] ${reqIdInfo}${data.method} ${data.url} ${status} ${data.duration}ms - ${data.ip}`;
  }

  private getStatusColor(statusCode: number): string {
    if (!this.enableColors) return '';

    if (statusCode >= 500) return '\x1b[31m'; // Red
    if (statusCode >= 400) return '\x1b[33m'; // Yellow
    if (statusCode >= 300) return '\x1b[36m'; // Cyan
    if (statusCode >= 200) return '\x1b[32m'; // Green
    return '\x1b[0m'; // Reset
  }

  private shouldLog(statusCode: number): boolean {
    switch (this.logLevel) {
      case 'error':
        return statusCode >= 500;
      case 'warn':
        return statusCode >= 400;
      case 'info':
      default:
        return true;
    }
  }
}
