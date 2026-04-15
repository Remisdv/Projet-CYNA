import { Controller, Post, Body, Res } from '@nestjs/common';
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

    res.cookie('Authentication', authResponse.access_token, {
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
