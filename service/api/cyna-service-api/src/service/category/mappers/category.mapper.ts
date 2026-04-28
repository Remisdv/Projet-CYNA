import { Injectable } from '@nestjs/common';
import { CategoryEntity } from '../../../database/entity/category/category.entity';
import { CategoryResponseDto } from '../dtos/category.dto';

@Injectable()
export class CategoryMapper {
    toDto(entity: CategoryEntity): CategoryResponseDto {
        return {
            id: entity.id,
            nom: entity.nom,
            description: entity.description,
            slug: entity.slug,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    toDtoArray(entities: CategoryEntity[]): CategoryResponseDto[] {
        return entities.map((e) => this.toDto(e));
    }
}
