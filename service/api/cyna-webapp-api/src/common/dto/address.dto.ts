import { IsString, IsOptional } from 'class-validator';

export class AddressDto {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    postalCode: string;

    @IsString()
    country: string;

    @IsString()
    @IsOptional()
    company?: string;
}
