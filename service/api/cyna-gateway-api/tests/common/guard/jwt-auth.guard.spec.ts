import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../../../src/common/guard/jwt-auth.guard';
import { AUTH_KEY } from '../../../src/common/decorator/auth.decorator';
import { ROLES_KEY } from '../../../src/common/decorator/roles.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let originalJwtSecret: string | undefined;

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
    cookieToken?: string,
  ): ExecutionContext => {
    const mockRequest = {
      cookies: cookieToken ? { Authentication: cookieToken } : {},
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
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = JWT_SECRET;
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  describe('canActivate', () => {
    it('should allow access to public routes by default (no decorators)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockExecutionContext();

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should require authentication when @Auth decorator is present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === AUTH_KEY) return true;
        return undefined;
      });
      const context = createMockExecutionContext();

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Authentication cookie missing');
    });

    it('should require authentication when @Roles decorator is present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['admin'];
        return undefined;
      });
      const context = createMockExecutionContext();

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Authentication cookie missing');
    });

    it('should allow access with valid JWT token on protected route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === AUTH_KEY) return true;
        return undefined;
      });
      const payload = { sub: '123', email: 'test@example.com' };
      const token = createToken(payload);
      const context = createMockExecutionContext(token);

      expect(guard.canActivate(context)).toBe(true);

      const request = context.switchToHttp().getRequest();
      expect(request.user).toMatchObject(payload);
    });

    it('should throw UnauthorizedException with invalid signature', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === AUTH_KEY) return true;
        return undefined;
      });
      const payload = { sub: '123' };
      const token = createToken(payload, 'wrong-secret');
      const context = createMockExecutionContext(token);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with expired token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === AUTH_KEY) return true;
        return undefined;
      });
      const payload = {
        sub: '123',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };
      const token = createToken(payload);
      const context = createMockExecutionContext(token);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should allow access with non-expired token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === AUTH_KEY) return true;
        return undefined;
      });
      const payload = {
        sub: '123',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };
      const token = createToken(payload);
      const context = createMockExecutionContext(token);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw UnauthorizedException with malformed token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === AUTH_KEY) return true;
        return undefined;
      });
      const context = createMockExecutionContext('invalid.token');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});
