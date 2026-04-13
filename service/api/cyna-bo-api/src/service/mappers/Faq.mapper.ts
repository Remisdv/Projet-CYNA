import { Injectable } from '@nestjs/common';
import { Faq } from '../../database/entity/Faq/Faq.entity';
import { FaqDto, CreateUpdateFaqDto } from '../dtos/Faq/Faq.dto';

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

  buildTree(entities: Faq[]): FaqDto[] {
    const map = new Map<string, FaqDto>();
    const roots: FaqDto[] = [];

    for (const e of entities) {
      map.set(e.id, this.toDto(e, []));
    }

    for (const e of entities) {
      if (e.parentId && map.has(e.parentId)) {
        map.get(e.parentId).children.push(map.get(e.id));
      } else if (!e.parentId) {
        roots.push(map.get(e.id));
      }
    }

    return roots.sort((a, b) => a.order - b.order);
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
