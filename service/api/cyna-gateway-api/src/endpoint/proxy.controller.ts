import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../service/proxy.service';
import { Public, Roles } from '../common';
import { BaseProxyController } from './base-proxy.controller';

@Controller('api/products')
export class ProductProxyController extends BaseProxyController {
  constructor(readonly proxyService: ProxyService) {
    super(proxyService);
  }

  /**
   * GET /api/products
   * List products (public sees only published, admin sees all)
   */
  @Get()
  @Public()
  async findAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/products${qs}`);
  }

  /**
   * GET /api/products/search?q=...
   * Search products
   */
  @Get('search')
  @Public()
  async search(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/products/search${qs}`);
  }

  /**
   * POST /api/products
   * Create product (admin only)
   */
  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/products');
  }

  /**
   * GET /api/products/:id
   * Get product details
   */
  @Get(':id')
  @Public()
  async findById(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}`);
  }

  /**
   * PUT /api/products/:id
   * Update product (admin only)
   */
  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}`);
  }

  /**
   * DELETE /api/products/:id
   * Delete product (admin only)
   */
  @Delete(':id')
  @Roles('admin')
  async delete(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}`);
  }

  /**
   * POST /api/products/:id/publish
   * Publish product (admin only)
   */
  @Post(':id/publish')
  @Roles('admin')
  async publish(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/publish`);
  }

  /**
   * POST /api/products/:id/duplicate
   * Duplicate product (admin only)
   */
  @Post(':id/duplicate')
  @Roles('admin')
  async duplicate(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/duplicate`);
  }

  /**
   * POST /api/products/:id/demo
   * Generate demo token (authenticated users)
   */
  @Post(':id/demo')
  @Roles('')
  async generateDemo(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/demo`);
  }

  /**
   * POST /api/products/:id/images
   * Add images (admin only)
   */
  @Post(':id/images')
  @Roles('admin')
  async addImages(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/images`);
  }

  /**
   * DELETE /api/products/:id/images/:imageId
   * Delete image (admin only)
   */
  @Delete(':id/images/:imageId')
  @Roles('admin')
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/images/${imageId}`);
  }

  /**
   * PATCH /api/products/:id/images/:imageId/main
   * Set main image (admin only)
   */
  @Patch(':id/images/:imageId/main')
  @Roles('admin')
  async setMainImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/images/${imageId}/main`);
  }

  /**
   * PUT /api/products/:id/images/order
   * Reorder images (admin only)
   */
  @Put(':id/images/order')
  @Roles('admin')
  async reorderImages(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/images/order`);
  }
}
