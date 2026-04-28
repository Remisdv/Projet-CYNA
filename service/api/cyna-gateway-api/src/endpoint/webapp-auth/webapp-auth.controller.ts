import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../common/decorator/public.decorator';
import { WebappAuthService } from '../../service/webapp-auth/webapp-auth.service';
import {
  WebappRegisterDto,
  WebappForgotPasswordDto,
  WebappResetPasswordBodyDto,
  WebappCreateSessionDto,
  WebappVerifySessionDto,
  WebappTwoFactorChallengeDto,
} from '../../dto/webapp-auth/webapp-auth.dto';

const COOKIE_NAME = 'Authentication';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
}

@Controller('api/webapp/auth')
export class WebappAuthController {
  constructor(private readonly authService: WebappAuthService) {}

  /** POST /api/webapp/auth/users — register a new account. */
  @Public()
  @Post('users')
  async register(@Body() dto: WebappRegisterDto, @Res() res: Response): Promise<void> {
    const authResponse = await this.authService.register(dto);

    setAuthCookie(res, authResponse.access_token);
    res.status(HttpStatus.CREATED).json({
      message: 'Registration successful',
      user: authResponse.user,
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
    });
  }

  /**
   * POST /api/webapp/auth/sessions — polymorphic.
   * Body { email, password } → login (may return 2FA pending without setting cookie)
   * Body { refresh_token } → refresh
   */
  @Public()
  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  async createSession(@Body() dto: WebappCreateSessionDto, @Res() res: Response): Promise<void> {
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

  /** PATCH /api/webapp/auth/sessions/current — verify 2FA code. */
  @Public()
  @Patch('sessions/current')
  @HttpCode(HttpStatus.OK)
  async verifySession(@Body() dto: WebappVerifySessionDto, @Res() res: Response): Promise<void> {
    const result = await this.authService.verifySession(dto.userId, dto.code);
    if ((result as any).access_token) {
      setAuthCookie(res, (result as any).access_token);
    }
    res.status(HttpStatus.OK).json(result);
  }

  /** POST /api/webapp/auth/sessions/current/two-factor-challenges — resend code. */
  @Public()
  @Post('sessions/current/two-factor-challenges')
  @HttpCode(HttpStatus.OK)
  async createTwoFactorChallenge(@Body() dto: WebappTwoFactorChallengeDto, @Res() res: Response): Promise<void> {
    const result = await this.authService.createTwoFactorChallenge(dto.userId);
    res.status(HttpStatus.OK).json(result);
  }

  /** DELETE /api/webapp/auth/sessions/current — logout (clear cookie). */
  @Public()
  @Delete('sessions/current')
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie(COOKIE_NAME);
    res.status(HttpStatus.OK).json({ message: 'Logout successful' });
  }

  /** POST /api/webapp/auth/password-resets — request a password reset email. */
  @Public()
  @Post('password-resets')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: WebappForgotPasswordDto, @Res() res: Response): Promise<void> {
    const result = await this.authService.requestPasswordReset(dto.email);
    res.status(HttpStatus.OK).json(result);
  }

  /** PATCH /api/webapp/auth/password-resets/:token — confirm a password reset. */
  @Public()
  @Patch('password-resets/:token')
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Param('token') token: string,
    @Body() dto: WebappResetPasswordBodyDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.confirmPasswordReset(token, dto.newPassword);
    res.status(HttpStatus.OK).json(result);
  }
}
