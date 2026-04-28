import { Injectable, NotFoundException } from '@nestjs/common';
import { Faq } from '../../database/entity/Faq/Faq.entity';
import { FaqRepository } from '../../repository/Faq/Faq.repository';
import { FaqMapper } from './mappers/Faq.mapper';
import { FaqDto, CreateUpdateFaqDto, ReorderFaqDto } from './dtos/Faq.dto';

@Injectable()
export class FaqService {
  constructor(
    private readonly faqRepository: FaqRepository,
    private readonly mapper: FaqMapper,
  ) { }

  async findTree(lang?: string): Promise<FaqDto[]> {
    const faqs = await this.faqRepository.findOrdered(lang);
    return this.buildTree(faqs);
  }

  async findOne(id: string): Promise<FaqDto> {
    const faq = await this.faqRepository.findById(id);
    if (!faq) throw new NotFoundException(`FAQ with id ${id} not found`);
    return this.mapper.toDto(faq);
  }

  async create(data: CreateUpdateFaqDto): Promise<FaqDto> {
    const entity = this.faqRepository.create(this.mapper.toEntity(data));
    const saved = await this.faqRepository.save(entity);
    return this.mapper.toDto(saved);
  }

  async update(id: string, data: CreateUpdateFaqDto): Promise<FaqDto> {
    const entity = await this.faqRepository.findById(id);
    if (!entity) throw new NotFoundException(`FAQ with id ${id} not found`);
    const updated = this.faqRepository.merge(entity, this.mapper.toEntity(data));
    const saved = await this.faqRepository.save(updated);
    return this.mapper.toDto(saved);
  }

  async reorder(id: string, dto: ReorderFaqDto): Promise<FaqDto> {
    const entity = await this.faqRepository.findById(id);
    if (!entity) throw new NotFoundException(`FAQ with id ${id} not found`);
    entity.order = dto.order;
    const saved = await this.faqRepository.save(entity);
    return this.mapper.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.faqRepository.findById(id);
    if (!entity) throw new NotFoundException(`FAQ with id ${id} not found`);
    await this.faqRepository.remove(entity);
  }

  private buildTree(entities: Faq[]): FaqDto[] {
    const map = new Map<string, FaqDto>();
    const roots: FaqDto[] = [];

    for (const e of entities) {
      map.set(e.id, this.mapper.toDto(e, []));
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
}
