import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RateLimitMiddleware } from '../../../src/common/middleware/rate-limit.middleware';

interface MockRequest {
  ip: string | undefined;
  headers: Record<string, string | string[] | undefined>;
}

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '5';

    middleware = new RateLimitMiddleware();

    mockRequest = {
      ip: '127.0.0.1',
      headers: {},
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    nextFunction = jest.fn();
  });

  afterEach(() => {
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
  });

  describe('use', () => {
    it('should call next function when under rate limit', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should set rate limit headers', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        expect.any(Number),
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(Number),
      );
    });

    it('should decrement remaining count on each request', () => {
      // First request
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 4);

      // Second request
      (mockResponse.setHeader as jest.Mock).mockClear();
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 3);
    });

    it('should throw HttpException when rate limit exceeded', () => {
      // Make 5 requests (max allowed)
      for (let i = 0; i < 5; i++) {
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        );
      }

      // 6th request should throw
      expect(() =>
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        ),
      ).toThrow(HttpException);

      try {
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      }
    });

    it('should set Retry-After header when rate limit exceeded', () => {
      // Exceed rate limit
      for (let i = 0; i < 5; i++) {
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        );
      }

      try {
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        );
      } catch (e) {
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Retry-After',
          expect.any(Number),
        );
      }
    });

    it('should track different IPs separately', () => {
      // First IP - 5 requests
      for (let i = 0; i < 5; i++) {
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        );
      }

      // First IP should be blocked
      expect(() =>
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        ),
      ).toThrow(HttpException);

      // Second IP should still work
      mockRequest.ip = '192.168.1.1';
      (mockResponse.setHeader as jest.Mock).mockClear();

      expect(() =>
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        ),
      ).not.toThrow();

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 4);
    });

    it('should use x-forwarded-for header when present', () => {
      mockRequest.ip = undefined;
      mockRequest.headers = {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      };

      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();

      // Make requests until limit
      for (let i = 0; i < 4; i++) {
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        );
      }

      // Should be blocked now
      expect(() =>
        middleware.use(
          mockRequest as any,
          mockResponse as Response,
          nextFunction,
        ),
      ).toThrow(HttpException);
    });
  });

  describe('configuration', () => {
    it('should use default values when env vars not set', () => {
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;

      const defaultMiddleware = new RateLimitMiddleware();

      defaultMiddleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      // Default is 100 requests
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
    });
  });
});
