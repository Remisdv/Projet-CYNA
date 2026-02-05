import { Response } from 'express';
import { CompressionMiddleware } from '../../../src/common/middleware/compression.middleware';

interface MockRequest {
  headers: Record<string, string | string[] | undefined>;
}

describe('CompressionMiddleware', () => {
  let middleware: CompressionMiddleware;
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    delete process.env.COMPRESSION_ENABLED;
    delete process.env.COMPRESSION_THRESHOLD;

    middleware = new CompressionMiddleware();

    mockRequest = {
      headers: {
        'accept-encoding': 'gzip, deflate, br',
      },
    };

    mockResponse = {
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    nextFunction = jest.fn();
  });

  afterEach(() => {
    delete process.env.COMPRESSION_ENABLED;
    delete process.env.COMPRESSION_THRESHOLD;
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

    it('should skip compression when disabled', () => {
      process.env.COMPRESSION_ENABLED = 'false';
      const disabledMiddleware = new CompressionMiddleware();

      const originalWrite = mockResponse.write;
      const originalEnd = mockResponse.end;

      disabledMiddleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.write).toBe(originalWrite);
      expect(mockResponse.end).toBe(originalEnd);
    });

    it('should skip compression when client does not accept gzip', () => {
      mockRequest.headers['accept-encoding'] = 'deflate, br';

      const originalWrite = mockResponse.write;
      const originalEnd = mockResponse.end;

      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.write).toBe(originalWrite);
      expect(mockResponse.end).toBe(originalEnd);
    });

    it('should override write and end methods when gzip is accepted', () => {
      const originalWrite = mockResponse.write;
      const originalEnd = mockResponse.end;

      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.write).not.toBe(originalWrite);
      expect(mockResponse.end).not.toBe(originalEnd);
    });

    it('should use custom threshold from environment', () => {
      process.env.COMPRESSION_THRESHOLD = '2048';
      const customMiddleware = new CompressionMiddleware();

      // Access private property for testing
      expect((customMiddleware as any).threshold).toBe(2048);
    });

    it('should use default threshold of 1024', () => {
      expect((middleware as any).threshold).toBe(1024);
    });

    it('should be enabled by default', () => {
      expect((middleware as any).enabled).toBe(true);
    });
  });
});
