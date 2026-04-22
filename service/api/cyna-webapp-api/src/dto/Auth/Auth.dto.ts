import { IsEmail, IsString, MinLength, IsOptional, Length, IsBoolean } from 'class-validator';

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

export class EnableEmailTwoFactorDto {
    @IsString()
    userId: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class SetupTotpDto {
    @IsString()
    userId: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class ConfirmEmailTwoFactorDto {
    @IsString()
    userId: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @Length(6, 6)
    code: string;
}

export class VerifyTotpSetupDto {
    @IsString()
    userId: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @Length(6, 6)
    code: string;
}

export class DisableTwoFactorDto {
    @IsString()
    userId: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @Length(6, 6)
    code: string;
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
