import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../database/entity/category/category.entity';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '../../dto/category/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
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

    while (await this.categoryRepository.findOneBy({ slug })) {
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
    const existingCategory = await this.categoryRepository.findOneBy({ nom: createCategoryDto.nom });
    if (existingCategory) {
      throw new ConflictException(`Une catégorie avec le nom ${createCategoryDto.nom} existe déjà`);
    }

    const category = new CategoryEntity();
    Object.assign(category, createCategoryDto);

    // Generate slug if not provided
    if (!category.slug) {
      category.slug = await this.generateUniqueSlug(category.nom);
    } else {
      const existingSlug = await this.categoryRepository.findOneBy({ slug: category.slug });
      if (existingSlug) {
        throw new ConflictException(`Une catégorie avec le slug ${category.slug} existe déjà`);
      }
    }

    const saved = await this.categoryRepository.save(category);
    return this.mapToResponseDto(saved);
  }

  /**
   * Get all categories
   */
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      order: { nom: 'ASC' },
    });

    return categories.map(category => this.mapToResponseDto(category));
  }

  /**
   * Get category by ID
   */
  async findById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'id ${id} introuvable`);
    }
    return this.mapToResponseDto(category);
  }

  /**
   * Update a category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'id ${id} introuvable`);
    }

    // Check if new name is already used
    if (updateCategoryDto.nom && updateCategoryDto.nom !== category.nom) {
      const existingCategory = await this.categoryRepository.findOneBy({ nom: updateCategoryDto.nom });
      if (existingCategory) {
        throw new ConflictException(`Une catégorie avec le nom ${updateCategoryDto.nom} existe déjà`);
      }
    }

    // Verify slug uniqueness if changed
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOneBy({ slug: updateCategoryDto.slug });
      if (existingSlug) {
        throw new ConflictException(`Une catégorie avec le slug ${updateCategoryDto.slug} existe déjà`);
      }
    }

    Object.assign(category, updateCategoryDto);
    const saved = await this.categoryRepository.save(category);
    return this.mapToResponseDto(saved);
  }

  /**
   * Delete a category
   */
  async remove(id: string): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Catégorie avec l'id ${id} introuvable`);
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(entity: CategoryEntity): CategoryResponseDto {
    return {
      id: entity.id,
      nom: entity.nom,
      description: entity.description,
      slug: entity.slug,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
