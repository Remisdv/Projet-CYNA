import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository, MoreThan, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { WebappUser } from '../../database/entity/WebappUser/WebappUser.entity';
import { PasswordResetToken } from '../../database/entity/WebappUser/PasswordResetToken.entity';
import { EmailService } from '../Email/Email.service';
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from '../dtos/auth/Auth.dto';

@Injectable()
export class WebappAuthService {
  constructor(
    @InjectRepository(WebappUser)
    private readonly userRepo: Repository<WebappUser>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: this.hashPassword(dto.password),
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const saved = await this.userRepo.save(user);
    return this.generateTokens(saved);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (this.hashPassword(dto.password) !== user.passwordHash) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return this.generateTokens(user);
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

    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    return {
      access_token: this.createAccessToken(user),
      refresh_token: this.createRefreshToken(user.id),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (!user) return; // Don't reveal if email exists

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    const resetToken = this.resetTokenRepo.create({
      userId: user.id,
      token,
      expiresAt,
    });
    await this.resetTokenRepo.save(resetToken);

    await this.emailService.sendPasswordReset(user.email, token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const resetToken = await this.resetTokenRepo.findOneBy({
      token: dto.token,
      usedAt: IsNull(),
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    const user = await this.userRepo.findOneBy({ id: resetToken.userId });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    user.passwordHash = this.hashPassword(dto.newPassword);
    await this.userRepo.save(user);

    resetToken.usedAt = new Date();
    await this.resetTokenRepo.save(resetToken);
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
