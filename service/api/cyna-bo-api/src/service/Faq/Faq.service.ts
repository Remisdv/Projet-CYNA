import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../../database/entity/Faq/Faq.entity';
import { FaqMapper } from '../mappers/Faq.mapper';
import { FaqDto, CreateUpdateFaqDto, ReorderFaqDto } from '../dtos/Faq/Faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly repo: Repository<Faq>,
    private readonly mapper: FaqMapper,
  ) {}

  async findTree(lang?: string): Promise<FaqDto[]> {
    const where = lang ? { lang } : {};
    const faqs = await this.repo.find({ where, order: { order: 'ASC' } });
    return this.mapper.buildTree(faqs);
  }

  async findOne(id: string): Promise<FaqDto> {
    const faq = await this.repo.findOneBy({ id });
    if (!faq) throw new NotFoundException(`FAQ with id ${id} not found`);
    return this.mapper.toDto(faq);
  }

  async create(data: CreateUpdateFaqDto): Promise<FaqDto> {
    const entity = this.repo.create(this.mapper.toEntity(data));
    const saved = await this.repo.save(entity);
    return this.mapper.toDto(saved);
  }

  async update(id: string, data: CreateUpdateFaqDto): Promise<FaqDto> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`FAQ with id ${id} not found`);
    const updated = this.repo.merge(entity, this.mapper.toEntity(data));
    const saved = await this.repo.save(updated);
    return this.mapper.toDto(saved);
  }

  async reorder(id: string, dto: ReorderFaqDto): Promise<FaqDto> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`FAQ with id ${id} not found`);
    entity.order = dto.order;
    const saved = await this.repo.save(entity);
    return this.mapper.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`FAQ with id ${id} not found`);
    await this.repo.remove(entity);
  }
}
