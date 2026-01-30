import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../../../src/common/guard/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const JWT_SECRET = 'test-secret';

  const createToken = (
    payload: object,
    secret: string = JWT_SECRET,
  ): string => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  };

  const createMockExecutionContext = (
    authHeader?: string,
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
      user: null,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('canActivate', () => {
    it('should allow access to public routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const context = createMockExecutionContext();

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw UnauthorizedException when no authorization header', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = createMockExecutionContext();

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Authorization header missing');
    });

    it('should throw UnauthorizedException when invalid authorization format', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = createMockExecutionContext('InvalidFormat token');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid authorization format');
    });

    it('should throw UnauthorizedException when Bearer without token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = createMockExecutionContext('Bearer ');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should allow access with valid JWT token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const payload = { sub: '123', email: 'test@example.com' };
      const token = createToken(payload);
      const context = createMockExecutionContext(`Bearer ${token}`);

      expect(guard.canActivate(context)).toBe(true);

      const request = context.switchToHttp().getRequest();
      expect(request.user).toMatchObject(payload);
    });

    it('should throw UnauthorizedException with invalid signature', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const payload = { sub: '123' };
      const token = createToken(payload, 'wrong-secret');
      const context = createMockExecutionContext(`Bearer ${token}`);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid or expired token');
    });

    it('should throw UnauthorizedException with expired token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const payload = {
        sub: '123',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };
      const token = createToken(payload);
      const context = createMockExecutionContext(`Bearer ${token}`);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid or expired token');
    });

    it('should allow access with non-expired token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const payload = {
        sub: '123',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };
      const token = createToken(payload);
      const context = createMockExecutionContext(`Bearer ${token}`);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw UnauthorizedException with malformed token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = createMockExecutionContext('Bearer invalid.token');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});
