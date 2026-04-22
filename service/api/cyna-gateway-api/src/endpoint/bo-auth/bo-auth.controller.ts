import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../common/decorator/public.decorator';
import { BoAuthService } from '../../service/bo-auth/bo-auth.service';
import { BoLoginDto, BoRefreshDto } from '../../dto/bo-auth/bo-auth.dto';

@Controller('api/bo/auth')
export class BoAuthController {
  constructor(private readonly authService: BoAuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: BoLoginDto, @Res() res: Response): Promise<void> {
    const authResponse = await this.authService.loginBo(loginDto);

    // If 2FA is required, return pending response without setting cookie
    if ((authResponse as any).requiresTwoFactor) {
      res.status(200).json(authResponse);
      return;
    }

    res.cookie('BoAuthentication', authResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: authResponse.user,
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
    });
  }

  @Public()
  @Post('2fa/verify')
  async verifyTwoFactor(@Body() body: { userId: string; code: string }, @Res() res: Response): Promise<void> {
    const result = await this.authService.verifyTwoFactor(body.userId, body.code);

    if (result.access_token) {
      res.cookie('BoAuthentication', result.access_token, {
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
  @Post('refresh')
  async refresh(@Body() dto: BoRefreshDto, @Res() res: Response): Promise<void> {
    const authResponse = await this.authService.refreshBo(dto.refresh_token);
    res.status(200).json(authResponse);
  }

  @Public()
  @Post('logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('BoAuthentication');
    res.status(200).json({ message: 'Logout successful' });
  }
}
