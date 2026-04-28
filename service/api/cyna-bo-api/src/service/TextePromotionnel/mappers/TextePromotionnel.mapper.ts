import { Injectable } from '@nestjs/common';
import { TextePromotionnel } from '../../../database/entity/TextePromotionnel/TextePromotionnel.entity';
import { TextePromotionnelDto, CreateUpdateTextePromotionnelDto } from '../dtos/TextePromotionnel.dto';

@Injectable()
export class TextePromotionnelMapper {
  toDto(entity: TextePromotionnel): TextePromotionnelDto {
    const dto = new TextePromotionnelDto();
    dto.id = entity.id;
    dto.textFr = entity.textFr;
    dto.textEn = entity.textEn;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  toDtoArray(entities: TextePromotionnel[]): TextePromotionnelDto[] {
    return entities.map(entity => this.toDto(entity));
  }

  toEntity(dto: CreateUpdateTextePromotionnelDto): Partial<TextePromotionnel> {
    const entity = new TextePromotionnel();
    entity.textFr = dto.textFr;
    entity.textEn = dto.textEn;
    return entity;
  }
}
