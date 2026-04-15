import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BoAuthService } from '../../service/auth/bo-auth.service';
import { BoLoginDto, BoAuthResponseDto, BoRefreshDto } from '../../service/dtos/auth/bo-auth.dto';

@Controller('auth')
export class BoAuthController {
  constructor(private readonly authService: BoAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: BoLoginDto): Promise<BoAuthResponseDto> {
    return this.authService.login(loginDto);
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
