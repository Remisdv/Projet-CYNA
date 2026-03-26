import { IsString, IsOptional, Length, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 255)
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class CategoryResponseDto {
  id: string;
  nom: string;
  description: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
