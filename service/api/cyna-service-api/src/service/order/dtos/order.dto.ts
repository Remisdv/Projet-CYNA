import { IsArray, IsEmail, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../../../database/entity/order';

export interface SyncOrderDto {
    ref: string;
    clientEmail: string;
    clientFirstName?: string;
    clientLastName?: string;
    items: any[];
    amount: number;
    status?: string;
    paymentStatus?: string;
    billingAddress?: any;
    shippingAddress?: any;
    createdAt?: string;
}

export class UpdateStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsOptional()
    @IsString()
    trackingNumber?: string;
}

export class UpdatePaymentStatusDto {
    @IsEnum(PaymentStatus)
    paymentStatus: PaymentStatus;
}

export class AddNoteDto {
    @IsString()
    text: string;
}

export class SendCredentialsDto {
    @IsArray()
    credentials: Array<{ serviceName: string; data: Record<string, string> }>;

    @IsOptional()
    @IsString()
    customMessage?: string;
}

export class SyncOrderBodyDto {
    @IsString()
    ref: string;

    @IsEmail()
    clientEmail: string;

    @IsOptional()
    @IsString()
    clientFirstName?: string;

    @IsOptional()
    @IsString()
    clientLastName?: string;

    @IsArray()
    items: any[];

    @IsNumber()
    @Type(() => Number)
    amount: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    paymentStatus?: string;

    @IsOptional()
    @IsObject()
    billingAddress?: any;

    @IsOptional()
    @IsObject()
    shippingAddress?: any;

    @IsOptional()
    @IsString()
    createdAt?: string;
}
