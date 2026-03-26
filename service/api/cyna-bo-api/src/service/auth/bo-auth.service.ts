import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../../database/entity/User/User.entity';
import { BoLoginDto, BoAuthResponseDto } from '../dtos/auth/bo-auth.dto';

@Injectable()
export class BoAuthService {
  private readonly jwtSecret: string;
  private readonly tokenExpiry: number = 24 * 60 * 60; // 24 hours in seconds

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-me';
  }

  /**
   * Authenticate BO user and return JWT token
   */
  async login(loginDto: BoLoginDto): Promise<BoAuthResponseDto> {
    const user = await this.userRepository.findOneBy({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const hashedPassword = this.hashPassword(loginDto.password);
    if (hashedPassword !== user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      type: 'bo', // User type: back-office
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Verify JWT token validity
   */
  verifyToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      const expectedSignature = crypto
        .createHmac('sha256', this.jwtSecret)
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
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: any): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const claims = {
      ...payload,
      iat: now,
      exp: now + this.tokenExpiry,
    };

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(claims)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  /**
   * Hash password (SHA256) - should use bcrypt in production
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
