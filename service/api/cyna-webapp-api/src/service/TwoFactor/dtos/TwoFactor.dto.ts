import { IsEmail, IsString, MinLength, IsOptional, Length, IsBoolean, IsIn } from 'class-validator';

export class EnableTwoFactorDto {
    @IsString()
    @IsIn(['email', 'totp'])
    type: 'email' | 'totp';

    @IsString()
    @MinLength(6)
    password: string;
}

export class ConfirmTwoFactorDto {
    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @Length(6, 6)
    code: string;
}

export class DisableTwoFactorDto {
    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @Length(6, 6)
    code: string;
}

export class ChallengeTwoFactorDto {
    @IsString()
    @MinLength(6)
    password: string;
}
