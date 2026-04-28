import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ProductEntity,
  ProductType,
  ProductStatus,
} from '../../database/entity/product';
import { ProductRepository } from '../../repository/product/product.repository';
import { CategoryRepository } from '../../repository/category/category.repository';
import { ProductMapper } from './mappers/product.mapper';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  UpdateImageOrderDto,
} from './dtos/product.dto';
import { ProductSearchService } from '../elasticsearch/product-search.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly mapper: ProductMapper,
    private readonly productSearchService: ProductSearchService,
  ) {}

  /**
   * Resolve a "categorie" filter value which can be either a UUID (matching
   * `product.categorie`) or a slug (requires a join on categories to resolve
   * the corresponding UUID). Returns the UUID string, or null if nothing
   * matches (caller should treat as "no result").
   */
  private async resolveCategoryId(value: string): Promise<string | null> {
    if (!value) return null;
    if (UUID_RE.test(value)) return value;
    const cat = await this.categoryRepository.findBySlug(value);
    return cat?.id ?? null;
  }

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
    if (saved.statut === ProductStatus.PUBLISHED) {
      void this.productSearchService.indexProduct(saved);
    }
    return this.mapper.toDto(saved);
  }

  /**
   * Get all products with filtering and pagination
   */
  async findAll(query: {
    page?: number;
    per_page?: number;
    categorie?: string;
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

    let resolvedCategorie: string | undefined;
    if (query.categorie) {
      const resolvedCatId = await this.resolveCategoryId(query.categorie);
      if (!resolvedCatId) {
        // Unknown slug/UUID => return empty result rather than ignoring the filter
        return { data: [], total: 0, page, per_page };
      }
      resolvedCategorie = resolvedCatId;
    }

    const { data, total } = await this.productRepository.findFiltered({
      page,
      per_page,
      statut: query.statut,
      categorie: resolvedCategorie,
      type: query.type,
      disponible: query.disponible,
      prix_min: query.prix_min,
      prix_max: query.prix_max,
      sort: query.sort,
    });

    return {
      data: this.mapper.toDtoArray(data),
      total,
      page,
      per_page,
    };
  }

  /**
   * Search products by keyword using Elasticsearch with SQL fallback.
   */
  async search(
    q: string,
    query?: { categorie?: string; type?: string },
  ): Promise<{ data: ProductResponseDto[]; total: number }> {
    const esIds = await this.productSearchService.search(q, query);

    if (esIds !== null) {
      if (esIds.length === 0) return { data: [], total: 0 };
      const entities = await this.productRepository.findManyPublishedByIds(esIds);
      const ordered = esIds
        .map((id) => entities.find((p) => p.id === id))
        .filter((p): p is ProductEntity => p !== undefined);
      return { data: this.mapper.toDtoArray(ordered), total: ordered.length };
    }

    // Elasticsearch unavailable: fall back to SQL ILIKE
    return this.searchFallback(q, query);
  }

  private async searchFallback(
    q: string,
    query?: { categorie?: string; type?: string },
  ): Promise<{ data: ProductResponseDto[]; total: number }> {
    let resolvedCategorie: string | undefined;
    if (query?.categorie) {
      const resolvedCatId = await this.resolveCategoryId(query.categorie);
      if (!resolvedCatId) return { data: [], total: 0 };
      resolvedCategorie = resolvedCatId;
    }

    const { data, total } = await this.productRepository.searchFallback(q, {
      categorie: resolvedCategorie,
      type: query?.type,
    });
    return { data: this.mapper.toDtoArray(data), total };
  }

  /**
   * Get product by ID
   */
  async findById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.mapper.toDto(product);
  }

  /**
   * Get product by slug
   */
  async findBySlug(slug: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return this.mapper.toDto(product);
  }

  /**
   * Update a product
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);

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
    if (updated.statut === ProductStatus.PUBLISHED) {
      void this.productSearchService.indexProduct(updated);
    } else {
      void this.productSearchService.removeProduct(updated.id);
    }
    return this.mapper.toDto(updated);
  }

  /**
   * Delete/Archive a product
   */
  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.remove(product);
    void this.productSearchService.removeProduct(id);
  }

  /**
   * Publish a product (change from draft to published)
   */
  async publish(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    product.statut = ProductStatus.PUBLISHED;
    const updated = await this.productRepository.save(product);
    void this.productSearchService.indexProduct(updated);
    return this.mapper.toDto(updated);
  }

  /**
   * Duplicate a product
   */
  async duplicate(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);

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
    return this.mapper.toDto(saved);
  }

  /**
   * Generate demo access token (TTL 24 hours)
   * In a real app, store this in Redis or a separate table
   */
  async generateDemoToken(id: string, userId: string): Promise<{ access_token_demo: string; expires_in: number }> {
    const product = await this.productRepository.findById(id);

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
    const product = await this.productRepository.findById(id);

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
    return this.mapper.toDto(updated);
  }

  /**
   * Delete an image
   */
  async deleteImage(productId: string, imageId: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(productId);

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
    return this.mapper.toDto(updated);
  }

  /**
   * Set main image
   */
  async setMainImage(productId: string, imageId: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(productId);

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
    return this.mapper.toDto(updated);
  }

  /**
   * Reorder images
   */
  async reorderImages(productId: string, updateImageOrderDto: UpdateImageOrderDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    product.images = updateImageOrderDto.images;
    const updated = await this.productRepository.save(product);
    return this.mapper.toDto(updated);
  }

  /**
   * Helper: Generate unique slug
   */
  private async generateUniqueSlug(nom: string): Promise<string> {
    let slug = this.generateSlug(nom);
    let counter = 1;

    while (await this.productRepository.findBySlug(slug)) {
      slug = `${this.generateSlug(nom)}-${counter}`;
      counter++;
    }

    return slug;
  }
}
