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
import { Public } from '../../common/decorator/public.decorator';
import { BoAuthService } from '../../service/bo-auth/bo-auth.service';
import {
  BoCreateSessionDto,
  BoVerifySessionDto,
  BoTwoFactorChallengeDto,
} from '../../dto/bo-auth/bo-auth.dto';

const COOKIE_NAME = 'BoAuthentication';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
}

@Controller('api/bo/auth')
export class BoAuthController {
  constructor(private readonly authService: BoAuthService) {}

  /**
   * POST /api/bo/auth/sessions — polymorphic.
   * Body { email, password } → login (returns 2FA pending response, no cookie yet)
   * Body { refresh_token } → refresh tokens
   */
  @Public()
  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  async createSession(@Body() dto: BoCreateSessionDto, @Res() res: Response): Promise<void> {
    const authResponse = await this.authService.createSession({
      email: dto.email,
      password: dto.password,
      refresh_token: dto.refresh_token,
    });

    if ((authResponse as any).requiresTwoFactor) {
      res.status(HttpStatus.OK).json(authResponse);
      return;
    }

    if ((authResponse as any).access_token) {
      setAuthCookie(res, (authResponse as any).access_token);
    }
    res.status(HttpStatus.OK).json(authResponse);
  }

  /** PATCH /api/bo/auth/sessions/current — verify 2FA code. */
  @Public()
  @Patch('sessions/current')
  @HttpCode(HttpStatus.OK)
  async verifySession(@Body() dto: BoVerifySessionDto, @Res() res: Response): Promise<void> {
    const result = await this.authService.verifySession(dto.userId, dto.code);
    if ((result as any).access_token) {
      setAuthCookie(res, (result as any).access_token);
    }
    res.status(HttpStatus.OK).json(result);
  }

  /** POST /api/bo/auth/sessions/current/two-factor-challenges — resend code. */
  @Public()
  @Post('sessions/current/two-factor-challenges')
  @HttpCode(HttpStatus.OK)
  async createTwoFactorChallenge(@Body() dto: BoTwoFactorChallengeDto, @Res() res: Response): Promise<void> {
    const result = await this.authService.createTwoFactorChallenge(dto.userId);
    res.status(HttpStatus.OK).json(result);
  }

  /** DELETE /api/bo/auth/sessions/current — logout. */
  @Public()
  @Delete('sessions/current')
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie(COOKIE_NAME);
    res.status(HttpStatus.OK).json({ message: 'Logout successful' });
  }
}
