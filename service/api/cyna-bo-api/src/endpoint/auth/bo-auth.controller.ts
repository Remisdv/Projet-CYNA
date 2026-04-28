import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BoAuthService } from '../../service/auth/bo-auth.service';
import {
  BoAuthResponseDto,
  CreateBoSessionDto,
  VerifyBoSessionDto,
  BoTwoFactorChallengeDto,
} from '../../service/auth/dtos/bo-auth.dto';

@Controller('auth')
export class BoAuthController {
  constructor(private readonly authService: BoAuthService) {}

  /**
   * Polymorphic session creation:
   * - body { email, password } → login (returns 2FA pending response)
   * - body { refresh_token } → refresh tokens
   */
  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  async createSession(@Body() dto: CreateBoSessionDto) {
    if (dto.refresh_token) {
      return this.authService.refresh({ refresh_token: dto.refresh_token });
    }
    return this.authService.login({ email: dto.email!, password: dto.password! });
  }

  /** Confirm a pending 2FA session by submitting the email code. */
  @Patch('sessions/current')
  @HttpCode(HttpStatus.OK)
  async verifySession(@Body() dto: VerifyBoSessionDto): Promise<BoAuthResponseDto> {
    return this.authService.verifyTwoFactor({ userId: dto.userId, code: dto.code });
  }

  /** (Re)send the email 2FA code for the pending session. */
  @Post('sessions/current/two-factor-challenges')
  @HttpCode(HttpStatus.OK)
  async createTwoFactorChallenge(@Body() dto: BoTwoFactorChallengeDto): Promise<{ message: string }> {
    await this.authService.resendTwoFactor(dto.userId);
    return { message: 'Code renvoyé' };
  }

  @Delete('sessions/current')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('BoAuthentication');
    res.status(200).json({ message: 'Logout successful' });
  }
}
