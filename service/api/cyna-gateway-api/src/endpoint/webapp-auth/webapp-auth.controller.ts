import { Controller, Post, Get, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../common/decorator/public.decorator';
import { WebappAuthService } from '../../service/webapp-auth/webapp-auth.service';
import {
  WebappLoginDto,
  WebappRegisterDto,
  WebappRefreshDto,
  WebappForgotPasswordDto,
  WebappResetPasswordDto,
} from '../../dto/webapp-auth/webapp-auth.dto';

@Controller('api/webapp/auth')
export class WebappAuthController {
  constructor(private readonly authService: WebappAuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: WebappRegisterDto, @Res() res: Response): Promise<void> {
    const authResponse = await this.authService.register(dto);

    res.cookie('Authentication', authResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: authResponse.user,
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
    });
  }

  @Public()
  @Post('login')
  async login(@Body() dto: WebappLoginDto, @Res() res: Response): Promise<void> {
    const authResponse = await this.authService.login(dto);

    // If 2FA required, return pending state (no cookie yet)
    if ((authResponse as any).requiresTwoFactor) {
      res.status(200).json(authResponse);
      return;
    }

    res.cookie('Authentication', (authResponse as any).access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: (authResponse as any).user,
      access_token: (authResponse as any).access_token,
      refresh_token: (authResponse as any).refresh_token,
    });
  }

  @Public()
  @Post('2fa/verify')
  async verifyTwoFactor(@Body() body: { userId: string; code: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.verifyTwoFactor(body.userId, body.code);

    if (result.access_token) {
      res.cookie('Authentication', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    res.status(200).json(result);
  }

  @Public()
  @Post('2fa/resend')
  async resendTwoFactor(@Body() body: { userId: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.resendTwoFactor(body.userId);
    res.status(200).json(result);
  }

  @Public()
  @Post('2fa/email/enable')
  async enableEmailTwoFactor(@Body() body: { userId: string; password: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.enableEmailTwoFactor(body.userId, body.password);
    res.status(200).json(result);
  }

  @Public()
  @Post('2fa/email/enable/confirm')
  async confirmEmailTwoFactor(@Body() body: { userId: string; password: string; code: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.confirmEmailTwoFactor(body.userId, body.password, body.code);
    res.status(200).json(result);
  }

  @Public()
  @Post('2fa/totp/setup')
  async setupTotp(@Body() body: { userId: string; password: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.setupTotp(body.userId, body.password);
    res.status(200).json(result);
  }

  @Public()
  @Post('2fa/totp/confirm')
  async confirmTotp(@Body() body: { userId: string; password: string; code: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.confirmTotp(body.userId, body.password, body.code);
    res.status(200).json(result);
  }

  @Public()
  @Post('2fa/disable/send-code')
  async sendDisableCode(@Body() body: { userId: string; password: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.sendDisableCode(body.userId, body.password);
    res.status(200).json(result);
  }

  @Public()
  @Post('2fa/disable')
  async disableTwoFactor(@Body() body: { userId: string; password: string; code: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.disableTwoFactor(body.userId, body.password, body.code);
    res.status(200).json(result);
  }

  @Public()
  @Get('2fa/status')
  async getTwoFactorStatus(@Query('userId') userId: string, @Res() res: Response): Promise<void> {
    const result = await this.authService.getTwoFactorStatus(userId);
    res.status(200).json(result);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: WebappRefreshDto, @Res() res: Response): Promise<void> {
    const authResponse = await this.authService.refresh(dto.refresh_token);
    res.status(200).json(authResponse);
  }

  @Public()
  @Post('logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('Authentication');
    res.status(200).json({ message: 'Logout successful' });
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: WebappForgotPasswordDto, @Res() res: Response): Promise<void> {
    const result = await this.authService.forgotPassword(dto.email);
    res.status(200).json(result);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: WebappResetPasswordDto, @Res() res: Response): Promise<void> {
    const result = await this.authService.resetPassword(dto.token, dto.newPassword);
    res.status(200).json(result);
  }
}
