import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { BoAuthService } from '../../service/auth/bo-auth.service';
import { BoLoginDto, BoAuthResponseDto } from '../../service/dtos/auth/bo-auth.dto';

@Controller('auth')
export class BoAuthController {
  constructor(private readonly authService: BoAuthService) {}

  /**
   * POST /auth/login
   * Authenticate BO user and return JWT token
   * Note: This endpoint is called by the Gateway at /api/bo/auth/login
   */
  @Post('login')
  async login(@Body() loginDto: BoLoginDto): Promise<BoAuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/logout
   * Logout endpoint (mainly for frontend to clear cookies)
   */
  @Post('logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('BoAuthentication');
    res.json({ message: 'Logout successful' });
  }
}
