import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

const NullToUndefined = () => Transform(({ value }) => (value === null ? undefined : value));

export class AddCartItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  productType: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @NullToUndefined()
  @IsNumber()
  @IsOptional()
  prix?: number;

  @NullToUndefined()
  @IsNumber()
  @IsOptional()
  prixMensuel?: number;

  @NullToUndefined()
  @IsNumber()
  @IsOptional()
  prixAnnuel?: number;

  @IsString()
  @IsOptional()
  periodicity?: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class UpdateCartItemDto {
  @IsNumber()
  quantity: number;
}

export class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCartItemDto)
  items: AddCartItemDto[];
}
