import { IsString } from 'class-validator';

export class ShippingUpdateDto {
    @IsString()
    email: string;

    @IsString()
    ref: string;

    @IsString()
    trackingNumber?: string;

    @IsString()
    status: string;
}

export class ServiceCredentialsDto {
    @IsString()
    email: string;

    @IsString()
    ref: string;

    @IsString()
    serviceName: string;
}
