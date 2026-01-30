import { Response } from 'express';
import { LoggerMiddleware } from '../../../src/common/middleware/logger.middleware';

interface MockRequest {
  method: string;
  originalUrl: string;
  ip: string | undefined;
  headers: Record<string, string | string[] | undefined>;
}

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_COLORS = 'false';

    middleware = new LoggerMiddleware();

    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Jest Test',
      },
    };

    const finishCallbacks: Function[] = [];
    mockResponse = {
      statusCode: 200,
      on: jest.fn((event: string, callback: Function) => {
        if (event === 'finish') {
          finishCallbacks.push(callback);
        }
        return mockResponse as Response;
      }),
      emit: jest.fn((event: string) => {
        if (event === 'finish') {
          finishCallbacks.forEach((cb) => cb());
        }
        return true;
      }),
    };

    nextFunction = jest.fn();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_COLORS;
  });

  describe('use', () => {
    it('should call next function', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should log request on response finish', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      // Simulate response finish
      (mockResponse.emit as jest.Mock)('finish');

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('GET');
      expect(logMessage).toContain('/test');
      expect(logMessage).toContain('200');
      expect(logMessage).toContain('127.0.0.1');
    });

    it('should include duration in log', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      (mockResponse.emit as jest.Mock)('finish');

      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toMatch(/\d+ms/);
    });

    it('should use x-forwarded-for header when ip is not available', () => {
      mockRequest.ip = undefined;
      mockRequest.headers = {
        ...mockRequest.headers,
        'x-forwarded-for': '192.168.1.1',
      };

      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      (mockResponse.emit as jest.Mock)('finish');

      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('192.168.1.1');
    });
  });

  describe('log levels', () => {
    it('should log all requests when LOG_LEVEL is info', () => {
      process.env.LOG_LEVEL = 'info';
      middleware = new LoggerMiddleware();

      mockResponse.statusCode = 200;
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );
      (mockResponse.emit as jest.Mock)('finish');

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should only log 4xx+ when LOG_LEVEL is warn', () => {
      process.env.LOG_LEVEL = 'warn';
      middleware = new LoggerMiddleware();

      // 200 should not be logged
      mockResponse.statusCode = 200;
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );
      (mockResponse.emit as jest.Mock)('finish');

      expect(consoleSpy).not.toHaveBeenCalled();

      // 400 should be logged
      consoleSpy.mockClear();
      mockResponse.statusCode = 400;
      const finishCallbacks: Function[] = [];
      mockResponse.on = jest.fn((event: string, callback: Function) => {
        if (event === 'finish') {
          finishCallbacks.push(callback);
        }
        return mockResponse as Response;
      });
      mockResponse.emit = jest.fn((event: string) => {
        if (event === 'finish') {
          finishCallbacks.forEach((cb) => cb());
        }
        return true;
      });

      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );
      (mockResponse.emit as jest.Mock)('finish');

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should only log 5xx when LOG_LEVEL is error', () => {
      process.env.LOG_LEVEL = 'error';
      middleware = new LoggerMiddleware();

      // 400 should not be logged
      mockResponse.statusCode = 400;
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );
      (mockResponse.emit as jest.Mock)('finish');

      expect(consoleSpy).not.toHaveBeenCalled();

      // 500 should be logged
      consoleSpy.mockClear();
      mockResponse.statusCode = 500;
      const finishCallbacks: Function[] = [];
      mockResponse.on = jest.fn((event: string, callback: Function) => {
        if (event === 'finish') {
          finishCallbacks.push(callback);
        }
        return mockResponse as Response;
      });
      mockResponse.emit = jest.fn((event: string) => {
        if (event === 'finish') {
          finishCallbacks.forEach((cb) => cb());
        }
        return true;
      });

      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );
      (mockResponse.emit as jest.Mock)('finish');

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
