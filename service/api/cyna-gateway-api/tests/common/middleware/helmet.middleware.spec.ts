import { Response } from 'express';
import { HelmetMiddleware } from '../../../src/common/middleware/helmet.middleware';

interface MockRequest {
  headers: Record<string, string | string[] | undefined>;
}

describe('HelmetMiddleware', () => {
  let middleware: HelmetMiddleware;
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new HelmetMiddleware();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    nextFunction = jest.fn();
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

    it('should set X-Content-Type-Options header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff',
      );
    });

    it('should set X-Frame-Options header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Frame-Options',
        'DENY',
      );
    });

    it('should set X-XSS-Protection header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-XSS-Protection',
        '1; mode=block',
      );
    });

    it('should set Strict-Transport-Security header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    });

    it('should set X-Download-Options header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Download-Options',
        'noopen',
      );
    });

    it('should set X-Permitted-Cross-Domain-Policies header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Permitted-Cross-Domain-Policies',
        'none',
      );
    });

    it('should set Referrer-Policy header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin',
      );
    });

    it('should set default Content-Security-Policy header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'self'",
      );
    });

    it('should use custom CSP from environment', () => {
      process.env.CSP_POLICY = "default-src 'self'; script-src 'self' 'unsafe-inline'";
      const customMiddleware = new HelmetMiddleware();

      customMiddleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'",
      );

      delete process.env.CSP_POLICY;
    });
  });
});
