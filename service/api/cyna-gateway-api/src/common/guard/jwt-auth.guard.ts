import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';
import { AUTH_KEY } from '../decorator/auth.decorator';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly secret: string;

  constructor(private reflector: Reflector) {
    this.secret = process.env.JWT_SECRET || 'default-secret-change-me';
  }

  canActivate(context: ExecutionContext): boolean {
    // 0. Check if route is public with @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 1. Check if route is protected by @Auth()
    const isProtected = this.reflector.getAllAndOverride<boolean>(AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Check if route requires roles @Roles(...)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If neither @Auth nor @Roles is present, the route is public
    if (!isProtected && !requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // Extract token from HTTP-only cookie
    // Ensure "cookie-parser" is installed and app.use(cookieParser()) is set in main.ts
    // The cookie name should match what is set by the authentication service
    const token = request.cookies?.['Authentication'];

    if (!token) {
      throw new UnauthorizedException('Authentication cookie missing');
    }

    try {
      const payload = this.verifyToken(token);
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private verifyToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signatureB64 !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    );

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }

    return payload;
  }
}
