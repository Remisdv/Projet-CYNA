import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../common/decorator/public.decorator';
import { BoAuthService } from '../../service/bo-auth/bo-auth.service';
import { BoLoginDto, BoAuthResponseDto } from '../../dto/bo-auth/bo-auth.dto';

@Controller('bo/auth')
export class BoAuthController {
  constructor(private readonly authService: BoAuthService) {}

  /**
   * POST /api/bo/auth/login
   * Authenticate back-office user
   * Calls BO service and sets authentication cookie
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: BoLoginDto, @Res() res: Response): Promise<void> {
    const authResponse = await this.authService.loginBo(loginDto);

    // Set JWT token as HTTP-only cookie
    res.cookie('BoAuthentication', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      message: 'Login successful',
      user: authResponse.user,
      token: authResponse.token, // Also return token for flexibility
    });
  }

  /**
   * POST /api/bo/auth/logout
   * Logout endpoint
   */
  @Public()
  @Post('logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('BoAuthentication');
    res.json({ message: 'Logout successful' });
  }
}
