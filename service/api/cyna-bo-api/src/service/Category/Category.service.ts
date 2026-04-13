import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entity/Category/Category.entity';
import { CategoryMapper } from '../mappers/Category.mapper';
import { CategoryDto, CreateUpdateCategoryDto } from '../dtos/Category/Category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    private readonly mapper: CategoryMapper,
  ) {}

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.repo.find({ order: { createdAt: 'ASC' } });
    return this.mapper.toDtoArray(categories);
  }

  async findOne(id: string): Promise<CategoryDto> {
    const category = await this.repo.findOneBy({ id });
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    return this.mapper.toDto(category);
  }

  async create(data: CreateUpdateCategoryDto): Promise<CategoryDto> {
    const entity = this.repo.create(this.mapper.toEntity(data));
    const saved = await this.repo.save(entity);
    return this.mapper.toDto(saved);
  }

  async update(id: string, data: CreateUpdateCategoryDto): Promise<CategoryDto> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Category with id ${id} not found`);
    const updated = this.repo.merge(entity, this.mapper.toEntity(data));
    const saved = await this.repo.save(updated);
    return this.mapper.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Category with id ${id} not found`);
    await this.repo.remove(entity);
  }
}
