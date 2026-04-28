import { IsString, IsEmail, MinLength, IsOptional, ValidateIf, Length } from 'class-validator';

export class WebappLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class WebappRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class WebappRefreshDto {
  @IsString()
  refresh_token: string;
}

export class WebappForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class WebappResetPasswordBodyDto {
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class WebappCreateSessionDto {
  @ValidateIf((o) => !o.refresh_token)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.refresh_token)
  @IsString()
  @MinLength(6)
  password?: string;

  @ValidateIf((o) => !o.email && !o.password)
  @IsString()
  refresh_token?: string;
}

export class WebappVerifySessionDto {
  @IsString()
  userId: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class WebappTwoFactorChallengeDto {
  @IsString()
  userId: string;
}

export class WebappAuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}
