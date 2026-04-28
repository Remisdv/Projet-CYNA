import { Injectable } from '@nestjs/common';
import { ServiceEntity } from '../../../database/entity/service/service.entity';
import { ServiceResponseDto } from '../dtos/service.dto';

@Injectable()
export class ServiceMapper {
    toDto(entity: ServiceEntity): ServiceResponseDto {
        return {
            id: entity.id,
            nom: entity.nom,
            categoryId: entity.categoryId,
            description: entity.description,
            statut: entity.statut,
            slug: entity.slug,
            meta_title: entity.meta_title,
            meta_description: entity.meta_description,
            keywords: entity.keywords,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    toDtoArray(entities: ServiceEntity[]): ServiceResponseDto[] {
        return entities.map((e) => this.toDto(e));
    }
}
