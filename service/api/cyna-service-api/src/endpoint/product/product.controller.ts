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
} from '../../service/product/dtos';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  /**
   * GET /products
   * List all products with filtering, pagination, sorting and search via ?q=
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
   * POST /products
   * Create a new product, or duplicate an existing one when ?from=:id is provided.
   */
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Query('from') from?: string,
  ): Promise<ProductResponseDto> {
    if (from) {
      return this.productService.duplicate(from);
    }
    return this.productService.create(createProductDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  /**
   * PATCH /products/:id
   * Partial product update (also used to publish via {statut:'published'}).
   */
  @Patch(':id')
  async patchUpdate(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id);
  }

  /**
   * POST /products/:id/demo-tokens
   * Generate a demo access token (24h TTL).
   */
  @Post(':id/demo-tokens')
  async generateDemoToken(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<{ access_token_demo: string; expires_in: number }> {
    return this.productService.generateDemoToken(id, userId);
  }

  @Post(':id/images')
  async addImages(
    @Param('id') id: string,
    @Body() body: { images: Array<{ url: string; est_principale?: boolean; ordre?: number }> },
  ): Promise<ProductResponseDto> {
    return this.productService.addImages(id, body.images);
  }

  @Delete(':id/images/:imageId')
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ): Promise<ProductResponseDto> {
    return this.productService.deleteImage(id, imageId);
  }

  /**
   * PATCH /products/:id/images/:imageId
   * Partial update of an image (set as main with {est_principale:true} or set order with {ordre:N}).
   */
  @Patch(':id/images/:imageId')
  async patchImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() body: { est_principale?: boolean; ordre?: number },
  ): Promise<ProductResponseDto> {
    return this.productService.patchImage(id, imageId, body);
  }
}

