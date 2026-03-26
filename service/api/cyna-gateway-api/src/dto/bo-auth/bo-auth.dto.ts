import { IsString, IsEmail, MinLength } from 'class-validator';

export class BoLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class BoAuthResponseDto {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
}
