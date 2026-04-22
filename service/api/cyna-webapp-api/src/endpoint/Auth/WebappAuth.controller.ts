import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebappAuthService } from '../../service/auth/WebappAuth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from '../../dto/Auth/Auth.dto';

@Controller('auth')
export class WebappAuthController {
  constructor(private readonly authService: WebappAuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
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
