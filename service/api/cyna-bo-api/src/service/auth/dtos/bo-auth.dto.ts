import { IsString, IsEmail, MinLength, Length } from 'class-validator';

export class BoLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class BoRefreshDto {
  @IsString()
  refresh_token: string;
}

export class TwoFactorVerifyDto {
  @IsString()
  userId: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class TwoFactorResendDto {
  @IsString()
  userId: string;
}

export class BoAuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
}

export class TwoFactorPendingResponseDto {
  requiresTwoFactor: true;
  userId: string;
  email: string;
}
