import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../../database/entity/User/User.entity';
import { BoEmailService } from '../email/BoEmail.service';
import { BoLoginDto, BoAuthResponseDto, BoRefreshDto, TwoFactorVerifyDto } from '../dtos/auth/bo-auth.dto';

export interface TwoFactorPendingResponse {
  requiresTwoFactor: true;
  userId: string;
  email: string;
}

@Injectable()
export class BoAuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: BoEmailService,
  ) { }

  async login(loginDto: BoLoginDto): Promise<TwoFactorPendingResponse> {
    const user = await this.userRepository.findOneBy({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = this.hashPassword(loginDto.password);
    if (hashedPassword !== user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate 6-digit code, store with 5-min expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = code;
    user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await this.userRepository.save(user);

    await this.emailService.sendTwoFactorCode(user.email, code);

    return { requiresTwoFactor: true, userId: user.id, email: user.email };
  }

  async verifyTwoFactor(dto: TwoFactorVerifyDto): Promise<BoAuthResponseDto> {
    const user = await this.userRepository.findOneBy({ id: dto.userId });

    if (!user || !user.twoFactorCode || !user.twoFactorCodeExpiry) {
      throw new UnauthorizedException('Code invalide');
    }

    if (new Date() > user.twoFactorCodeExpiry) {
      throw new UnauthorizedException('Code expiré, veuillez en demander un nouveau');
    }

    if (user.twoFactorCode !== dto.code) {
      throw new UnauthorizedException('Code invalide');
    }

    // Consume the code (one-time use)
    user.twoFactorCode = null;
    user.twoFactorCodeExpiry = null;
    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async resendTwoFactor(userId: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = code;
    user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await this.userRepository.save(user);

    await this.emailService.sendTwoFactorCode(user.email, code);
  }

  async refresh(dto: BoRefreshDto): Promise<{ access_token: string; refresh_token: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refresh_token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userRepository.findOneBy({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      access_token: this.createAccessToken(user),
      refresh_token: this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: '7d' }),
    };
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private generateTokens(user: User): BoAuthResponseDto {
    return {
      access_token: this.createAccessToken(user),
      refresh_token: this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: '7d' }),
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

  private createAccessToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        type: 'bo',
      },
      { expiresIn: '24h' },
    );
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
