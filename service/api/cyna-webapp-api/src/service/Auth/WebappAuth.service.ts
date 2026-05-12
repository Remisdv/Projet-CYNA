import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { WebappUser } from '../../database/entity/WebappUser/WebappUser.entity';
import { WebappUserRepository } from '../../repository/WebappUser/WebappUser.repository';
import { PasswordResetTokenRepository } from '../../repository/PasswordResetToken/PasswordResetToken.repository';
import { EmailService } from '../Email/Email.service';
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
  TwoFactorVerifyDto,
} from './dtos/Auth.dto';

export interface TwoFactorPendingResponse {
  requiresTwoFactor: true;
  userId: string;
  email: string;
  method: 'email' | 'totp';
}

@Injectable()
export class WebappAuthService {
  constructor(
    private readonly userRepository: WebappUserRepository,
    private readonly resetTokenRepository: PasswordResetTokenRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) { }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash: this.hashPassword(dto.password),
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const saved = await this.userRepository.save(user);
    return this.generateTokens(saved);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto | TwoFactorPendingResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (this.hashPassword(dto.password) !== user.passwordHash) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // If 2FA is enabled, initiate 2FA flow instead of issuing tokens
    if (user.twoFactorEnabled) {
      if (user.totpEnabled) {
        // TOTP: no email needed, just await code from authenticator app
        return { requiresTwoFactor: true, userId: user.id, email: user.email, method: 'totp' };
      } else {
        // Email 2FA: generate and send code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = code;
        user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await this.userRepository.save(user);
        await this.emailService.send2FACode(user.email, user.firstName, code);
        return { requiresTwoFactor: true, userId: user.id, email: user.email, method: 'email' };
      }
    }

    return this.generateTokens(user);
  }

  async verifyTwoFactor(dto: TwoFactorVerifyDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (user.totpEnabled && user.totpSecret) {
      // Validate TOTP code
      const isValid = speakeasy.totp.verify({ token: dto.code, secret: user.totpSecret, encoding: 'base32' });
      if (!isValid) {
        throw new UnauthorizedException('Code invalide');
      }
    } else {
      // Validate email code
      if (!user.twoFactorCode || !user.twoFactorCodeExpiry) {
        throw new UnauthorizedException('Code invalide');
      }
      if (new Date() > user.twoFactorCodeExpiry) {
        throw new UnauthorizedException('Code expiré, veuillez en demander un nouveau');
      }
      if (user.twoFactorCode !== dto.code) {
        throw new UnauthorizedException('Code invalide');
      }
      // Consume email code (one-time use)
      user.twoFactorCode = null;
      user.twoFactorCodeExpiry = null;
      await this.userRepository.save(user);
    }

    return this.generateTokens(user);
  }

  async resendTwoFactor(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    if (!user.twoFactorEnabled || user.totpEnabled) {
      throw new BadRequestException('Renvoi de code non applicable');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = code;
    user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await this.userRepository.save(user);
    await this.emailService.send2FACode(user.email, user.firstName, code);
  }

  async refresh(dto: RefreshDto): Promise<{ access_token: string; refresh_token: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refresh_token);
    } catch {
      throw new UnauthorizedException('Token de rafraîchissement invalide ou expiré');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Type de token invalide');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    return {
      access_token: this.createAccessToken(user),
      refresh_token: this.createRefreshToken(user.id),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) return; // Don't reveal if email exists

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    const resetToken = this.resetTokenRepository.create({
      userId: user.id,
      token,
      expiresAt,
    });
    await this.resetTokenRepository.save(resetToken);

    await this.emailService.sendPasswordReset(user.email, token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const resetToken = await this.resetTokenRepository.findActiveByToken(dto.token);

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    user.passwordHash = this.hashPassword(dto.newPassword);
    await this.userRepository.save(user);

    resetToken.usedAt = new Date();
    await this.resetTokenRepository.save(resetToken);
  }

  private generateTokens(user: WebappUser): AuthResponseDto {
    return {
      access_token: this.createAccessToken(user),
      refresh_token: this.createRefreshToken(user.id),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        twoFactorEnabled: user.twoFactorEnabled,
        totpEnabled: user.totpEnabled,
      },
    };
  }

  private createAccessToken(user: WebappUser): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'customer',
        type: 'webapp',
      },
      { expiresIn: '24h' },
    );
  }

  private createRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
