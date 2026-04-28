import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { WebappUserRepository } from '../../repository/WebappUser/WebappUser.repository';
import { EmailService } from '../Email/Email.service';

export type TwoFactorType = 'email' | 'totp';

export interface TwoFactorMethodStatus {
  type: TwoFactorType;
  enabled: boolean;
}

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly userRepository: WebappUserRepository,
    private readonly emailService: EmailService,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async list(userId: string): Promise<TwoFactorMethodStatus[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return [
      { type: 'email', enabled: user.twoFactorEnabled && !user.totpEnabled },
      { type: 'totp', enabled: user.totpEnabled },
    ];
  }

  async enable(
    userId: string,
    type: TwoFactorType,
    password: string,
  ): Promise<{ message: string } | { type: 'totp'; secret: string; qrCodeDataUrl: string; otpAuthUrl: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    if (this.hashPassword(password) !== user.passwordHash) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    if (type === 'email') {
      if (user.twoFactorEnabled && !user.totpEnabled) {
        throw new BadRequestException('La 2FA email est déjà activée');
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = code;
      user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
      await this.userRepository.save(user);
      await this.emailService.send2FACode(user.email, user.firstName, code);
      return { message: 'Code de vérification envoyé par email' };
    }

    // type === 'totp'
    const secretObj = speakeasy.generateSecret({ name: `CYNA (${user.email})` });
    const secret = secretObj.base32;
    const otpAuthUrl = secretObj.otpauth_url!;
    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    user.totpSecret = secret;
    await this.userRepository.save(user);

    return { type: 'totp', secret, qrCodeDataUrl, otpAuthUrl };
  }

  async confirm(
    userId: string,
    type: TwoFactorType,
    password: string,
    code: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    if (this.hashPassword(password) !== user.passwordHash) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    if (type === 'email') {
      if (!user.twoFactorCode || !user.twoFactorCodeExpiry) {
        throw new BadRequestException('Aucun code en attente, veuillez recommencer');
      }
      if (new Date() > user.twoFactorCodeExpiry) {
        throw new UnauthorizedException('Code expiré, veuillez recommencer');
      }
      if (user.twoFactorCode !== code) {
        throw new UnauthorizedException('Code invalide');
      }

      user.twoFactorEnabled = true;
      user.totpEnabled = false;
      user.totpSecret = null;
      user.twoFactorCode = null;
      user.twoFactorCodeExpiry = null;
      await this.userRepository.save(user);
      return { message: 'Authentification à deux facteurs par email activée' };
    }

    // type === 'totp'
    if (!user.totpSecret) {
      throw new BadRequestException('Configuration TOTP non initialisée');
    }
    const isValid = speakeasy.totp.verify({ token: code, secret: user.totpSecret, encoding: 'base32' });
    if (!isValid) {
      throw new UnauthorizedException('Code invalide');
    }
    user.totpEnabled = true;
    user.twoFactorEnabled = true;
    user.twoFactorCode = null;
    user.twoFactorCodeExpiry = null;
    await this.userRepository.save(user);
    return { message: 'Authentification TOTP activée avec succès' };
  }

  async disable(
    userId: string,
    type: TwoFactorType,
    password: string,
    code: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    if (this.hashPassword(password) !== user.passwordHash) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    if (type === 'totp') {
      if (!user.totpEnabled || !user.totpSecret) {
        throw new BadRequestException('TOTP non activé');
      }
      const isValid = speakeasy.totp.verify({ token: code, secret: user.totpSecret, encoding: 'base32' });
      if (!isValid) throw new UnauthorizedException('Code TOTP invalide');
    } else {
      // email
      if (!user.twoFactorEnabled || user.totpEnabled) {
        throw new BadRequestException('2FA email non activée');
      }
      if (!user.twoFactorCode || !user.twoFactorCodeExpiry) {
        throw new BadRequestException("Aucun code en attente, veuillez demander un code d'abord");
      }
      if (new Date() > user.twoFactorCodeExpiry) {
        throw new UnauthorizedException('Code expiré, veuillez en demander un nouveau');
      }
      if (user.twoFactorCode !== code) throw new UnauthorizedException('Code invalide');
    }

    user.twoFactorEnabled = false;
    user.totpEnabled = false;
    user.totpSecret = null;
    user.twoFactorCode = null;
    user.twoFactorCodeExpiry = null;
    await this.userRepository.save(user);
    return { message: 'Authentification à deux facteurs désactivée' };
  }

  /** Resend a verification or disable code by email. Not applicable for totp. */
  async challenge(
    userId: string,
    type: TwoFactorType,
    password: string,
  ): Promise<{ message: string }> {
    if (type === 'totp') {
      throw new BadRequestException('Aucun challenge à envoyer pour TOTP');
    }
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    if (this.hashPassword(password) !== user.passwordHash) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = code;
    user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await this.userRepository.save(user);
    await this.emailService.send2FACode(user.email, user.firstName, code);
    return { message: 'Code envoyé par email' };
  }
}
