import { IsArray, IsString, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../../common/dto/address.dto';

export { AddressDto };

class PaymentItemDto {
    @IsString()
    productId: string;

    @IsString()
    productName: string;

    @IsString()
    productType: 'produit' | 'service';

    @IsNumber()
    quantity: number;

    @IsNumber()
    unitPrice: number;

    @IsString()
    @IsOptional()
    periodicity?: 'mensuel' | 'annuel';
}

export class CreatePaymentIntentDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PaymentItemDto)
    items: PaymentItemDto[];

    @ValidateNested()
    @Type(() => AddressDto)
    billingAddress: AddressDto;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsOptional()
    shippingAddress?: AddressDto;
}

export class ConfirmPaymentDto {
    @IsString()
    paymentIntentId: string;
}

export class ConfirmOrderDto {
    @IsString()
    orderId: string;
}
