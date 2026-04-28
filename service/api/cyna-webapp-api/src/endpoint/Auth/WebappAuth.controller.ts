import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebappAuthService } from '../../service/Auth/WebappAuth.service';
import {
  RegisterDto,
  CreateSessionDto,
  VerifySessionDto,
  TwoFactorChallengeDto,
  ForgotPasswordDto,
  ResetPasswordBodyDto,
  AuthResponseDto,
} from '../../service/Auth/dtos/Auth.dto';

@Controller('auth')
export class WebappAuthController {
  constructor(private readonly authService: WebappAuthService) {}

  @Post('users')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * Polymorphic session creation:
   * - body { email, password } → login (or 2FA pending)
   * - body { refresh_token } → refresh
   */
  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  async createSession(@Body() dto: CreateSessionDto) {
    if (dto.refresh_token) {
      return this.authService.refresh({ refresh_token: dto.refresh_token });
    }
    return this.authService.login({ email: dto.email!, password: dto.password! });
  }

  /** Confirm a pending 2FA session by submitting the code. */
  @Patch('sessions/current')
  @HttpCode(HttpStatus.OK)
  async verifySession(@Body() dto: VerifySessionDto): Promise<AuthResponseDto> {
    return this.authService.verifyTwoFactor({ userId: dto.userId, code: dto.code });
  }

  /** Resend the email 2FA code for a pending session. */
  @Post('sessions/current/two-factor-challenges')
  @HttpCode(HttpStatus.OK)
  async createTwoFactorChallenge(@Body() dto: TwoFactorChallengeDto): Promise<{ message: string }> {
    await this.authService.resendTwoFactor(dto.userId);
    return { message: 'Code renvoyé' };
  }

  @Delete('sessions/current')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    return { message: 'Déconnexion réussie' };
  }

  @Post('password-resets')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto);
    return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' };
  }

  @Patch('password-resets/:token')
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Param('token') token: string,
    @Body() dto: ResetPasswordBodyDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword({ token, newPassword: dto.newPassword });
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
