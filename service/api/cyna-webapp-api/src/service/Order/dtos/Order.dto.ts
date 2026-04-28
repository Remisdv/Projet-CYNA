import { IsArray, IsString, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../../common/dto/address.dto';

export { AddressDto };

class OrderItemDto {
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

    @IsNumber()
    subtotal: number;
}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ValidateNested()
    @Type(() => AddressDto)
    billingAddress: AddressDto;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsOptional()
    shippingAddress?: AddressDto;

    @IsString()
    @IsOptional()
    paymentIntentId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class OrderResponseDto {
    id: string;
    ref: string;
    items: any[];
    amount: number;
    status: string;
    paymentStatus: string;
    billingAddress: any;
    shippingAddress: any;
    createdAt: Date;
    updatedAt: Date;
}
