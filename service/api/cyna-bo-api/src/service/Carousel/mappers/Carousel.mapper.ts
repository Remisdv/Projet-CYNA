import { Injectable } from '@nestjs/common';
import { CarouselItem } from '../../database/entity/Carousel/CarouselItem.entity';
import { CarouselItemDto, CreateUpdateCarouselItemDto } from '../dtos/Carousel/Carousel.dto';

@Injectable()
export class CarouselMapper {
  toDto(entity: CarouselItem): CarouselItemDto {
    return {
      id: entity.id,
      image: {
        id: entity.imageUrl || '',
        url: entity.imageUrl || '',
        altText: entity.imageAlt || '',
      },
      title: entity.title || '',
      text: entity.text || '',
      link: entity.link || '',
      order: entity.order,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toDtoArray(entities: CarouselItem[]): CarouselItemDto[] {
    return entities.map((e) => this.toDto(e));
  }

  toEntity(dto: CreateUpdateCarouselItemDto): Partial<CarouselItem> {
    return {
      imageUrl: dto.imageId,
      imageAlt: dto.imageAlt,
      title: dto.title,
      text: dto.text,
      link: dto.link,
      order: dto.order !== undefined ? dto.order : 0,
    };
  }
}
