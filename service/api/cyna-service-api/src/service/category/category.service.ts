import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryEntity } from '../../database/entity/category/category.entity';
import { CategoryRepository } from '../../repository/category/category.repository';
import { CategoryMapper } from './mappers/category.mapper';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from './dtos/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly mapper: CategoryMapper,
  ) {}

  /**
   * Generate a slug from the category name
   */
  private generateSlug(nom: string): string {
    return nom
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate a unique slug
   */
  private async generateUniqueSlug(nom: string): Promise<string> {
    let slug = this.generateSlug(nom);
    let counter = 1;

    while (await this.categoryRepository.findBySlug(slug)) {
      slug = `${this.generateSlug(nom)}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Check if category with same name exists
    const existingCategory = await this.categoryRepository.findByName(createCategoryDto.nom);
    if (existingCategory) {
      throw new ConflictException(`Une catégorie avec le nom ${createCategoryDto.nom} existe déjà`);
    }

    const category = new CategoryEntity();
    Object.assign(category, createCategoryDto);

    // Generate slug if not provided
    if (!category.slug) {
      category.slug = await this.generateUniqueSlug(category.nom);
    } else {
      const existingSlug = await this.categoryRepository.findBySlug(category.slug);
      if (existingSlug) {
        throw new ConflictException(`Une catégorie avec le slug ${category.slug} existe déjà`);
      }
    }

    const saved = await this.categoryRepository.save(category);
    return this.mapper.toDto(saved);
  }

  /**
   * Get all categories
   */
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAllOrderedByName();
    return this.mapper.toDtoArray(categories);
  }

  /**
   * Get category by ID
   */
  async findById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'id ${id} introuvable`);
    }
    return this.mapper.toDto(category);
  }

  /**
   * Update a category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'id ${id} introuvable`);
    }

    // Check if new name is already used
    if (updateCategoryDto.nom && updateCategoryDto.nom !== category.nom) {
      const existingCategory = await this.categoryRepository.findByName(updateCategoryDto.nom);
      if (existingCategory) {
        throw new ConflictException(`Une catégorie avec le nom ${updateCategoryDto.nom} existe déjà`);
      }
    }

    // Verify slug uniqueness if changed
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findBySlug(updateCategoryDto.slug);
      if (existingSlug) {
        throw new ConflictException(`Une catégorie avec le slug ${updateCategoryDto.slug} existe déjà`);
      }
    }

    Object.assign(category, updateCategoryDto);
    const saved = await this.categoryRepository.save(category);
    return this.mapper.toDto(saved);
  }

  /**
   * Delete a category
   */
  async remove(id: string): Promise<void> {
    const affected = await this.categoryRepository.deleteById(id);
    if (affected === 0) {
      throw new NotFoundException(`Catégorie avec l'id ${id} introuvable`);
    }
  }
}
