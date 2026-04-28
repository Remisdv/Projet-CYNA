import { Injectable } from '@nestjs/common';
import { Faq } from '../../../database/entity/Faq/Faq.entity';
import { FaqDto, CreateUpdateFaqDto } from '../dtos/Faq.dto';

@Injectable()
export class FaqMapper {
  toDto(entity: Faq, children: FaqDto[] = []): FaqDto {
    return {
      id: entity.id,
      parentId: entity.parentId || null,
      question: entity.question,
      answer: entity.answer || '',
      lang: entity.lang,
      order: entity.order,
      children,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toEntity(dto: CreateUpdateFaqDto): Partial<Faq> {
    return {
      parentId: dto.parentId || null,
      question: dto.question,
      answer: dto.answer,
      lang: dto.lang || 'fr',
      order: dto.order !== undefined ? dto.order : 0,
    };
  }
}
