import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  ProductEntity,
  ProductCategory,
  ProductType,
  ProductStatus,
  ServicePeriodicity,
} from '../../database/entity/product';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  UpdateImageOrderDto,
} from '../../dto/product';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * Generate a slug from the product name
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
   * Calculate annual discount percentage
   */
  private calculateAnnualDiscount(prix_mensuel: number, prix_annuel: number): number {
    if (!prix_mensuel || !prix_annuel) return 0;
    const monthlyTotal = prix_mensuel * 12;
    const discount = ((monthlyTotal - prix_annuel) / monthlyTotal) * 100;
    return Math.round(discount * 100) / 100;
  }

  /**
   * Create a new product or service
   */
  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = new ProductEntity();

    Object.assign(product, createProductDto);

    // Always generate a unique slug (use provided slug as base, or the name)
    product.slug = await this.generateUniqueSlug(product.slug || product.nom);

    // For services, calculate annual discount if both prices provided
    if (product.type === ProductType.SERVICE && product.prix_mensuel && product.prix_annuel) {
      product.remise_annuelle_pct = this.calculateAnnualDiscount(
        product.prix_mensuel,
        product.prix_annuel,
      );
    }

    // Ensure stock defaults
    if (product.type === ProductType.PRODUCT && product.stock === undefined && !product.stock_illimite) {
      product.stock_illimite = 'illimit\u00e9';
    }

    const saved = await this.productRepository.save(product);
    return this.mapToResponseDto(saved);
  }

  /**
   * Get all products with filtering and pagination
   */
  async findAll(query: {
    page?: number;
    per_page?: number;
    categorie?: ProductCategory;
    type?: ProductType;
    statut?: ProductStatus | 'all';
    prix_min?: number;
    prix_max?: number;
    disponible?: boolean;
    sort?: string;
  }): Promise<{
    data: ProductResponseDto[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const page = query.page || 1;
    const per_page = query.per_page || 20;
    const skip = (page - 1) * per_page;

    let queryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply filters
    if (query.statut === 'all') {
      // No status filter: admin sees all statuses
    } else if (query.statut) {
      queryBuilder = queryBuilder.where('product.statut = :statut', { statut: query.statut });
    } else {
      // Default: show only published products to public
      queryBuilder = queryBuilder.where('product.statut = :statut', {
        statut: ProductStatus.PUBLISHED,
      });
    }

    if (query.categorie) {
      queryBuilder = queryBuilder.andWhere('product.categorie = :categorie', {
        categorie: query.categorie,
      });
    }

    if (query.type) {
      queryBuilder = queryBuilder.andWhere('product.type = :type', { type: query.type });
    }

    if (query.disponible !== undefined && query.disponible) {
      queryBuilder = queryBuilder.andWhere('(product.stock > 0 OR product.stock_illimite = :illimite)', {
        illimite: 'illimit\u00e9',
      });
    }

    // Price range filter
    if (Number.isFinite(query.prix_min)) {
      queryBuilder = queryBuilder.andWhere(
        '(product.prix >= :prix_min OR product.prix_mensuel >= :prix_min)',
        { prix_min: query.prix_min },
      );
    }

    if (Number.isFinite(query.prix_max)) {
      queryBuilder = queryBuilder.andWhere(
        '(product.prix <= :prix_max OR product.prix_mensuel <= :prix_max)',
        { prix_max: query.prix_max },
      );
    }

    // Apply sorting
    switch (query.sort) {
      case 'prix_asc':
        queryBuilder = queryBuilder.orderBy(
          'COALESCE(product.prix, product.prix_mensuel)',
          'ASC',
        );
        break;
      case 'prix_desc':
        queryBuilder = queryBuilder.orderBy(
          'COALESCE(product.prix, product.prix_mensuel)',
          'DESC',
        );
        break;
      case 'nouveautes':
        queryBuilder = queryBuilder.orderBy('product.date_creation', 'DESC');
        break;
      case 'featured':
      default:
        queryBuilder = queryBuilder.orderBy('product.date_modification', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(per_page)
      .getManyAndCount();

    return {
      data: data.map((product) => this.mapToResponseDto(product)),
      total,
      page,
      per_page,
    };
  }

  /**
   * Search products by keyword (full-text, basic implementation)
   */
  async search(q: string, query?: any): Promise<{
    data: ProductResponseDto[];
    total: number;
  }> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.where('product.statut = :statut', { statut: ProductStatus.PUBLISHED });

    if (q) {
      queryBuilder.andWhere(
        '(product.nom ILIKE :q OR product.description_courte ILIKE :q OR product.description_longue ILIKE :q OR product.tags::text ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    // Apply same filters as findAll if provided
    if (query?.categorie) {
      queryBuilder.andWhere('product.categorie = :categorie', {
        categorie: query.categorie,
      });
    }

    if (query?.type) {
      queryBuilder.andWhere('product.type = :type', { type: query.type });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((product) => this.mapToResponseDto(product)),
      total,
    };
  }

  /**
   * Get product by ID
   */
  async findById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.mapToResponseDto(product);
  }

  /**
   * Get product by slug
   */
  async findBySlug(slug: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { slug } });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return this.mapToResponseDto(product);
  }

  /**
   * Update a product
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    Object.assign(product, updateProductDto);

    // Recalculate discount if prices changed
    if (
      product.type === ProductType.SERVICE &&
      product.prix_mensuel &&
      product.prix_annuel &&
      (updateProductDto.prix_mensuel || updateProductDto.prix_annuel)
    ) {
      product.remise_annuelle_pct = this.calculateAnnualDiscount(
        product.prix_mensuel,
        product.prix_annuel,
      );
    }

    const updated = await this.productRepository.save(product);
    return this.mapToResponseDto(updated);
  }

  /**
   * Delete/Archive a product
   */
  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.remove(product);
  }

  /**
   * Publish a product (change from draft to published)
   */
  async publish(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    product.statut = ProductStatus.PUBLISHED;
    const updated = await this.productRepository.save(product);
    return this.mapToResponseDto(updated);
  }

  /**
   * Duplicate a product
   */
  async duplicate(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const duplicate = new ProductEntity();
    Object.assign(duplicate, product);

    duplicate.id = undefined;
    duplicate.nom = `${product.nom} (Copy)`;
    duplicate.slug = await this.generateUniqueSlug(`${product.nom} (Copy)`);
    duplicate.statut = ProductStatus.DRAFT;
    duplicate.date_creation = new Date();
    duplicate.date_modification = new Date();

    const saved = await this.productRepository.save(duplicate);
    return this.mapToResponseDto(saved);
  }

  /**
   * Generate demo access token (TTL 24 hours)
   * In a real app, store this in Redis or a separate table
   */
  async generateDemoToken(id: string, userId: string): Promise<{ access_token_demo: string; expires_in: number }> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.type !== ProductType.SERVICE) {
      throw new BadRequestException('Demo tokens are only available for services');
    }

    if (!product.demo_disponible) {
      throw new BadRequestException('Demo is not available for this service');
    }

    // Generate token (in production, use JWT or a secure token generation method)
    const token = `demo_${uuidv4()}`;
    const expiresIn = 24 * 60 * 60; // 24 hours in seconds

    // TODO: Store token with TTL in Redis
    // await this.redisService.set(`demo_token:${token}`, JSON.stringify({ userId, productId: id }), 'EX', expiresIn);

    return {
      access_token_demo: token,
      expires_in: expiresIn,
    };
  }

  /**
   * Upload/Add images
   */
  async addImages(
    id: string,
    images: Array<{ url: string; est_principale?: boolean; ordre?: number }>,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (!product.images) {
      product.images = [];
    }

    images.forEach((img, index) => {
      product.images.push({
        id: uuidv4(),
        url: img.url,
        est_principale: product.images.length === 0 && index === 0 ? true : img.est_principale || false,
        ordre: product.images.length + index + 1,
      });
    });

    const updated = await this.productRepository.save(product);
    return this.mapToResponseDto(updated);
  }

  /**
   * Delete an image
   */
  async deleteImage(productId: string, imageId: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!product.images) {
      throw new NotFoundException('No images found');
    }

    const imageIndex = product.images.findIndex((img) => img.id === imageId);

    if (imageIndex === -1) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    product.images.splice(imageIndex, 1);

    const updated = await this.productRepository.save(product);
    return this.mapToResponseDto(updated);
  }

  /**
   * Set main image
   */
  async setMainImage(productId: string, imageId: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!product.images) {
      throw new NotFoundException('No images found');
    }

    const imageIndex = product.images.findIndex((img) => img.id === imageId);

    if (imageIndex === -1) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    // Unset all main images
    product.images.forEach((img) => {
      img.est_principale = false;
    });

    // Set as main
    product.images[imageIndex].est_principale = true;

    const updated = await this.productRepository.save(product);
    return this.mapToResponseDto(updated);
  }

  /**
   * Reorder images
   */
  async reorderImages(productId: string, updateImageOrderDto: UpdateImageOrderDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    product.images = updateImageOrderDto.images;
    const updated = await this.productRepository.save(product);
    return this.mapToResponseDto(updated);
  }

  /**
   * Helper: Generate unique slug
   */
  private async generateUniqueSlug(nom: string): Promise<string> {
    let slug = this.generateSlug(nom);
    let counter = 1;

    while (
      await this.productRepository.findOne({
        where: { slug },
      })
    ) {
      slug = `${this.generateSlug(nom)}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Helper: Map entity to response DTO
   */
  private mapToResponseDto(entity: ProductEntity): ProductResponseDto {
    const dto = new ProductResponseDto();
    Object.assign(dto, entity);

    // Handle stock display
    if (entity.type === ProductType.PRODUCT) {
      dto.stock = entity.stock_illimite === 'illimit\u00e9' ? 'illimit\u00e9' : entity.stock;
    }

    return dto;
  }
}
