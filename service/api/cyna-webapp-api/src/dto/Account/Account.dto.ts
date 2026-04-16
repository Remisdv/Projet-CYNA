import { IsString, IsOptional, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../../common/dto/address.dto';

export { AddressDto };

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsOptional()
    billingAddress?: AddressDto;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsOptional()
    shippingAddress?: AddressDto;
}

export class ChangePasswordDto {
    @IsString()
    @MinLength(6)
    currentPassword: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class ProfileResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    billingAddress: any;
    shippingAddress: any;
    createdAt: Date;
}
