import { IsString, IsEmail, MinLength } from 'class-validator';

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
