import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  OnModuleDestroy,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Rate Limiting Middleware
 * 
 * WARNING: This implementation uses in-memory storage (Map). 
 * In a multi-instance production environment, this will not work correctly 
 * as the rate limit state will be isolated to each instance.
 * For production with multiple instances, use a shared storage solution like Redis.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware, OnModuleDestroy {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly requests: Map<string, RateLimitRecord> = new Map();
  private interval: NodeJS.Timeout;

  constructor() {
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

    this.interval = setInterval(() => this.cleanupExpiredRecords(), this.windowMs);
  }

  onModuleDestroy() {
    clearInterval(this.interval);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const clientKey = this.getClientKey(req);
    const now = Date.now();

    let record = this.requests.get(clientKey);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    record.count++;
    this.requests.set(clientKey, record);

    const remaining = Math.max(0, this.maxRequests - record.count);
    const resetTime = Math.ceil(record.resetTime / 1000);

    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (record.count > this.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }

  private getClientKey(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ||
      req.ip ||
      'unknown';

    return ip.trim();
  }

  private cleanupExpiredRecords(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}
