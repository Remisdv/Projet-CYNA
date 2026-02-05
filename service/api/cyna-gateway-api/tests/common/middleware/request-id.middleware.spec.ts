import { Response } from 'express';
import {
  RequestIdMiddleware,
  REQUEST_ID_HEADER,
} from '../../../src/common/middleware/request-id.middleware';

interface MockRequest {
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
}

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();

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

    it('should generate a new request ID when not provided', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect((mockRequest as any).requestId).toBeDefined();
      expect((mockRequest as any).requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should use existing request ID from header', () => {
      const existingId = '123e4567-e89b-12d3-a456-426614174000';
      mockRequest.headers['x-request-id'] = existingId;

      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect((mockRequest as any).requestId).toBe(existingId);
    });

    it('should set request ID in response header', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        REQUEST_ID_HEADER,
        expect.any(String),
      );
    });

    it('should set same ID in request and response', () => {
      middleware.use(
        mockRequest as any,
        mockResponse as Response,
        nextFunction,
      );

      const requestId = (mockRequest as any).requestId;
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        REQUEST_ID_HEADER,
        requestId,
      );
    });

    it('should export REQUEST_ID_HEADER constant', () => {
      expect(REQUEST_ID_HEADER).toBe('X-Request-Id');
    });
  });
});
