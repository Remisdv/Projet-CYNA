import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BoAuthService } from '../../service/auth/bo-auth.service';
import { BoLoginDto, BoAuthResponseDto, BoRefreshDto, TwoFactorVerifyDto, TwoFactorResendDto } from '../../service/dtos/auth/bo-auth.dto';

@Controller('auth')
export class BoAuthController {
  constructor(private readonly authService: BoAuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: BoLoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyTwoFactor(@Body() dto: TwoFactorVerifyDto): Promise<BoAuthResponseDto> {
    return this.authService.verifyTwoFactor(dto);
  }

  @Post('2fa/resend')
  @HttpCode(HttpStatus.OK)
  async resendTwoFactor(@Body() dto: TwoFactorResendDto): Promise<{ message: string }> {
    await this.authService.resendTwoFactor(dto.userId);
    return { message: 'Code renvoyé' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: BoRefreshDto): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('BoAuthentication');
    res.status(200).json({ message: 'Logout successful' });
  }
}
