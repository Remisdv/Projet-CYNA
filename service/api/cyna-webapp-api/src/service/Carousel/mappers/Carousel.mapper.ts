import { Injectable } from '@nestjs/common';
import { CarouselItem } from '../../../database/entity/Carousel/CarouselItem.entity';
import { CarouselItemDto } from '../dtos/Carousel.dto';

@Injectable()
export class CarouselMapper {
    toDto(entity: CarouselItem): CarouselItemDto {
        return {
            id: entity.id,
            image: {
                url: entity.imageUrl || '',
                altText: entity.imageAlt || '',
            },
            title: entity.title || '',
            text: entity.text || '',
            link: entity.link || '',
            order: entity.order,
        };
    }

    toDtoArray(entities: CarouselItem[]): CarouselItemDto[] {
        return entities.map((e) => this.toDto(e));
    }
}
