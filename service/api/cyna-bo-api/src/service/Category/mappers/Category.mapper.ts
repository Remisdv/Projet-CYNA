import { Injectable } from '@nestjs/common';
import { Category } from '../../database/entity/Category/Category.entity';
import { CategoryDto, CategoryTranslationDto, CreateUpdateCategoryDto } from '../dtos/Category/Category.dto';

@Injectable()
export class CategoryMapper {
  toDto(entity: Category): CategoryDto {
    const translations: CategoryTranslationDto[] = [
      {
        id: `${entity.id}-fr`,
        lang: 'fr',
        name: entity.nameFr,
        description: entity.descFr || '',
      },
      {
        id: `${entity.id}-en`,
        lang: 'en',
        name: entity.nameEn,
        description: entity.descEn || '',
      },
    ];

    return {
      id: entity.id,
      slug: entity.slug,
      isActive: entity.isActive,
      translations,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toDtoArray(entities: Category[]): CategoryDto[] {
    return entities.map((e) => this.toDto(e));
  }

  toEntity(dto: CreateUpdateCategoryDto): Partial<Category> {
    const frTr = dto.translations?.find((t) => t.lang === 'fr');
    const enTr = dto.translations?.find((t) => t.lang === 'en');
    return {
      slug: dto.slug,
      nameFr: frTr?.name || '',
      descFr: frTr?.description,
      nameEn: enTr?.name || '',
      descEn: enTr?.description,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };
  }
}
