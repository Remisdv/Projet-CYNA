import { IsEmail, IsString, MinLength, IsOptional, Length, IsBoolean, ValidateIf } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class RefreshDto {
    @IsString()
    refresh_token: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
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

/**
 * Polymorphic session creation: either { email, password } (login) or { refresh_token } (refresh).
 */
export class CreateSessionDto {
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

export class VerifySessionDto {
    @IsString()
    userId: string;

    @IsString()
    @Length(6, 6)
    code: string;
}

export class TwoFactorChallengeDto {
    @IsString()
    userId: string;
}

export class ResetPasswordBodyDto {
    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class AuthResponseDto {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        twoFactorEnabled?: boolean;
        totpEnabled?: boolean;
    };
}
