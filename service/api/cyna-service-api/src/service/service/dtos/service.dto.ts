import { IsString, IsEnum, IsOptional, MaxLength, Length } from 'class-validator';
import { ServiceStatus } from '../../../database/entity/service/service.entity';

export class CreateServiceDto {
  @IsString()
  @Length(1, 255)
  nom: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  statut?: ServiceStatus;

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
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  nom?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  statut?: ServiceStatus;

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
}

export class ServiceResponseDto {
  id: string;
  nom: string;
  categoryId: string;
  description: string;
  statut: ServiceStatus;
  slug: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  createdAt: Date;
  updatedAt: Date;
}
