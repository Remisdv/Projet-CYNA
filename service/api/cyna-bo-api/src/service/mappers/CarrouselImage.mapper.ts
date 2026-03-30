import { Injectable } from '@nestjs/common';
import { CarrouselImages } from '../../database/entity/CarrouselImages/CarrouselImages.entity';
import { CarrouselImageDto, CreateUpdateCarrouselImageDto } from '../dtos/CarrouselImage.dto';

@Injectable()
export class CarrouselImageMapper {
  toDto(entity: CarrouselImages): CarrouselImageDto {
    const dto = new CarrouselImageDto();
    dto.id = entity.id;
    dto.imageUrl = entity.imageUrl;
    dto.altText = entity.altText;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  toDtoArray(entities: CarrouselImages[]): CarrouselImageDto[] {
    return entities.map(entity => this.toDto(entity));
  }

  toEntity(dto: CreateUpdateCarrouselImageDto): Partial<CarrouselImages> {
    const entity = new CarrouselImages();
    entity.imageUrl = dto.imageUrl;
    entity.altText = dto.altText;
    entity.isActive = dto.isActive;
    return entity;
  }
}
