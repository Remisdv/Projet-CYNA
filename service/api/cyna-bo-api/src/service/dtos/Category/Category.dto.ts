import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryTranslationDto {
  id: string;
  lang: string;
  name: string;
  description: string;
}

export class CategoryDto {
  id: string;
  slug: string;
  isActive: boolean;
  translations: CategoryTranslationDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryTranslationInputDto {
  @IsString()
  lang: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateUpdateCategoryDto {
  @IsString()
  slug: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationInputDto)
  translations: CategoryTranslationInputDto[];
}
