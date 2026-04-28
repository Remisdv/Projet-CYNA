import { IsString, IsEmail, MinLength, ValidateIf, Length } from 'class-validator';


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

export class BoCreateSessionDto {
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

export class BoVerifySessionDto {
  @IsString()
  userId: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class BoTwoFactorChallengeDto {
  @IsString()
  userId: string;
}

export class BoAuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
}
