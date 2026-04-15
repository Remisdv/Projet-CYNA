import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

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

export class WebappResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
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
