import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WebappAuthService } from '../../service/Auth/WebappAuth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
  TwoFactorVerifyDto,
  TwoFactorResendDto,
  EnableEmailTwoFactorDto,
  ConfirmEmailTwoFactorDto,
  SetupTotpDto,
  VerifyTotpSetupDto,
  DisableTwoFactorDto,
} from '../../service/Auth/dtos/Auth.dto';

@Controller('auth')
export class WebappAuthController {
  constructor(private readonly authService: WebappAuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyTwoFactor(@Body() dto: TwoFactorVerifyDto): Promise<AuthResponseDto> {
    return this.authService.verifyTwoFactor(dto);
  }

  @Post('2fa/resend')
  @HttpCode(HttpStatus.OK)
  async resendTwoFactor(@Body() dto: TwoFactorResendDto): Promise<{ message: string }> {
    await this.authService.resendTwoFactor(dto.userId);
    return { message: 'Code renvoyé' };
  }

  @Post('2fa/email/enable')
  @HttpCode(HttpStatus.OK)
  async enableEmailTwoFactor(@Body() dto: EnableEmailTwoFactorDto): Promise<{ message: string }> {
    return this.authService.enableEmailTwoFactor(dto.userId, dto.password);
  }

  @Post('2fa/email/enable/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmailTwoFactor(@Body() dto: ConfirmEmailTwoFactorDto): Promise<{ message: string }> {
    return this.authService.confirmEmailTwoFactor(dto.userId, dto.password, dto.code);
  }

  @Post('2fa/totp/setup')
  @HttpCode(HttpStatus.OK)
  async setupTotp(@Body() dto: SetupTotpDto): Promise<{ secret: string; qrCodeDataUrl: string; otpAuthUrl: string }> {
    return this.authService.setupTotp(dto.userId, dto.password);
  }

  @Post('2fa/totp/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmTotp(@Body() dto: VerifyTotpSetupDto): Promise<{ message: string }> {
    return this.authService.verifyTotpSetup(dto.userId, dto.password, dto.code);
  }

  @Post('2fa/disable/send-code')
  @HttpCode(HttpStatus.OK)
  async sendDisableCode(@Body() body: { userId: string; password: string }): Promise<{ message: string }> {
    return this.authService.sendDisableCode(body.userId, body.password);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(@Body() dto: DisableTwoFactorDto): Promise<{ message: string }> {
    return this.authService.disableTwoFactor(dto.userId, dto.password, dto.code);
  }

  @Get('2fa/status')
  async getTwoFactorStatus(@Query('userId') userId: string): Promise<{ twoFactorEnabled: boolean; totpEnabled: boolean }> {
    return this.authService.getTwoFactorStatus(userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    return { message: 'Déconnexion réussie' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto);
    return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
