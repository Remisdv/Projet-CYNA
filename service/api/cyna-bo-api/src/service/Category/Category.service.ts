import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../../repository/Category/Category.repository';
import { CategoryMapper } from './mappers/Category.mapper';
import { CategoryDto, CreateUpdateCategoryDto } from './dtos/Category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly mapper: CategoryMapper,
  ) { }

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepository.findAllOrdered();
    return this.mapper.toDtoArray(categories);
  }

  async findOne(id: string): Promise<CategoryDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    return this.mapper.toDto(category);
  }

  async create(data: CreateUpdateCategoryDto): Promise<CategoryDto> {
    const entity = this.categoryRepository.create(this.mapper.toEntity(data));
    const saved = await this.categoryRepository.save(entity);
    return this.mapper.toDto(saved);
  }

  async update(id: string, data: CreateUpdateCategoryDto): Promise<CategoryDto> {
    const entity = await this.categoryRepository.findById(id);
    if (!entity) throw new NotFoundException(`Category with id ${id} not found`);
    const updated = this.categoryRepository.merge(entity, this.mapper.toEntity(data));
    const saved = await this.categoryRepository.save(updated);
    return this.mapper.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.categoryRepository.findById(id);
    if (!entity) throw new NotFoundException(`Category with id ${id} not found`);
    await this.categoryRepository.remove(entity);
  }
}
