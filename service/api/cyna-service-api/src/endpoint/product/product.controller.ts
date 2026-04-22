import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ProductService } from '../../service/product/product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  UpdateImageOrderDto,
} from '../../dto/product';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * GET /products
   * List all products with filtering, pagination, and sorting
   * Public endpoint
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
    @Query('categorie') categorie?: string,
    @Query('type') type?: string,
    @Query('statut') statut?: string,
    @Query('prix_min') prix_min?: string,
    @Query('prix_max') prix_max?: string,
    @Query('disponible') disponible?: string,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
  ) {
    if (q && q.trim()) {
      return this.productService.search(q.trim(), { categorie, type });
    }
    return this.productService.findAll({
      page: page ? Number(page) : undefined,
      per_page: per_page ? Number(per_page) : undefined,
      categorie: categorie as any,
      type: type as any,
      statut: statut as any,
      prix_min: prix_min ? parseFloat(prix_min) : undefined,
      prix_max: prix_max ? parseFloat(prix_max) : undefined,
      disponible: disponible === 'true' ? true : undefined,
      sort,
    });
  }

  /**
   * GET /products/search?q=...
   * Search products by keyword
   * Public endpoint
   */
  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('categorie') categorie?: string,
    @Query('type') type?: string,
  ) {
    return this.productService.search(q, { categorie, type });
  }

  /**
   * POST /products
   * Create a new product
   * Admin only
   */
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productService.create(createProductDto);
  }

  /**
   * GET /products/:id
   * Get product details by ID
   * Public endpoint
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }

  /**
   * PUT /products/:id
   * Update a product
   * Admin only
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id
   * Delete/Archive a product
   * Admin only
   */
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id);
  }

  /**
   * POST /products/:id/publish
   * Publish a product (change from draft to published)
   * Admin only
   */
  @Post(':id/publish')
  async publish(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.publish(id);
  }

  /**
   * POST /products/:id/duplicate
   * Duplicate a product
   * Admin only
   */
  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.duplicate(id);
  }

  /**
   * POST /products/:id/demo
   * Generate a demo access token (24h TTL)
   * Authenticated users only
   */
  @Post(':id/demo')
  async generateDemoToken(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<{ access_token_demo: string; expires_in: number }> {
    return this.productService.generateDemoToken(id, userId);
  }

  /**
   * POST /products/:id/images
   * Upload/Add images to a product
   * Admin only
   */
  @Post(':id/images')
  async addImages(
    @Param('id') id: string,
    @Body() body: { images: Array<{ url: string; est_principale?: boolean; ordre?: number }> },
  ): Promise<ProductResponseDto> {
    return this.productService.addImages(id, body.images);
  }

  /**
   * DELETE /products/:id/images/:imageId
   * Delete an image
   * Admin only
   */
  @Delete(':id/images/:imageId')
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ): Promise<ProductResponseDto> {
    return this.productService.deleteImage(id, imageId);
  }

  /**
   * PATCH /products/:id/images/:imageId/main
   * Set an image as main
   * Admin only
   */
  @Patch(':id/images/:imageId/main')
  async setMainImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ): Promise<ProductResponseDto> {
    return this.productService.setMainImage(id, imageId);
  }

  /**
   * PUT /products/:id/images/order
   * Reorder images
   * Admin only
   */
  @Put(':id/images/order')
  async reorderImages(
    @Param('id') id: string,
    @Body() updateImageOrderDto: UpdateImageOrderDto,
  ): Promise<ProductResponseDto> {
    return this.productService.reorderImages(id, updateImageOrderDto);
  }
}
