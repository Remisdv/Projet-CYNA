import { IsString, IsEnum, IsArray, IsOptional, IsDecimal, IsBoolean, IsInt, MaxLength, Length } from 'class-validator';
import { ProductCategory, ProductType, ServicePeriodicity, ProductStatus } from '../../database/entity/product';

export class CreateProductDto {
  @IsString()
  @Length(1, 255)
  nom: string;

  @IsString()
  @MaxLength(100)
  description_courte: string;

  @IsOptional()
  @IsString()
  description_longue?: string;

  @IsEnum(ProductCategory)
  categorie: ProductCategory;

  @IsEnum(ProductType)
  type: ProductType;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  meta_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  meta_description?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  // Product-specific
  @IsOptional()
  @IsDecimal()
  prix?: number;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsOptional()
  @IsString()
  stock_illimite?: string;

  @IsOptional()
  @IsInt()
  seuil_alerte_stock?: number;

  // Service-specific
  @IsOptional()
  @IsDecimal()
  prix_mensuel?: number;

  @IsOptional()
  @IsDecimal()
  prix_annuel?: number;

  @IsOptional()
  @IsEnum(ServicePeriodicity)
  periodicite?: ServicePeriodicity;

  @IsOptional()
  @IsBoolean()
  renouvellement_auto?: boolean;

  @IsOptional()
  @IsBoolean()
  demo_disponible?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  nom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description_courte?: string;

  @IsOptional()
  @IsString()
  description_longue?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  categorie?: ProductCategory;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  meta_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  meta_description?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsDecimal()
  prix?: number;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsOptional()
  @IsString()
  stock_illimite?: string;

  @IsOptional()
  @IsInt()
  seuil_alerte_stock?: number;

  @IsOptional()
  @IsDecimal()
  prix_mensuel?: number;

  @IsOptional()
  @IsDecimal()
  prix_annuel?: number;

  @IsOptional()
  @IsEnum(ServicePeriodicity)
  periodicite?: ServicePeriodicity;

  @IsOptional()
  @IsBoolean()
  renouvellement_auto?: boolean;

  @IsOptional()
  @IsBoolean()
  demo_disponible?: boolean;
}

export class ProductResponseDto {
  id: string;
  nom: string;
  description_courte: string;
  description_longue?: string;
  categorie: ProductCategory;
  type: ProductType;
  tags?: string[];
  statut: ProductStatus;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  prix?: number;
  stock?: number | string;
  seuil_alerte_stock?: number;
  prix_mensuel?: number;
  prix_annuel?: number;
  remise_annuelle_pct?: number;
  periodicite?: ServicePeriodicity;
  renouvellement_auto?: boolean;
  demo_disponible?: boolean;
  images?: Array<{
    id: string;
    url: string;
    est_principale: boolean;
    ordre: number;
  }>;
  date_creation: Date;
  date_modification: Date;
}

export class ImageDto {
  id: string;
  url: string;
  est_principale: boolean;
  ordre: number;
}

export class UpdateImageOrderDto {
  @IsArray()
  images: ImageDto[];
}
