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

@Controller('api/products')
export class ProductProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  /**
   * GET /api/products
   * List products (public sees only published, admin sees all)
   */
  @Get()
  @Public()
  async findAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/products');
  }

  /**
   * GET /api/products/search?q=...
   * Search products
   */
  @Get('search')
  @Public()
  async search(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/products/search${req.url.slice(req.url.indexOf('?'))}`);
  }

  /**
   * POST /api/products
   * Create product (admin only)
   */
  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/products');
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
    await this.proxy(req, res, `/products/${id}`);
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
    await this.proxy(req, res, `/products/${id}`);
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
    await this.proxy(req, res, `/products/${id}`);
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
    await this.proxy(req, res, `/products/${id}/publish`);
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
    await this.proxy(req, res, `/products/${id}/duplicate`);
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
    await this.proxy(req, res, `/products/${id}/demo`);
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
    await this.proxy(req, res, `/products/${id}/images`);
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
    await this.proxy(req, res, `/products/${id}/images/${imageId}`);
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
    await this.proxy(req, res, `/products/${id}/images/${imageId}/main`);
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
    await this.proxy(req, res, `/products/${id}/images/order`);
  }

  /**
   * Proxy request to service-api
   */
  private async proxy(
    req: Request,
    res: Response,
    path: string,
  ): Promise<void> {
    try {
      // Copy relevant headers
      const headers: Record<string, string> = {};
      const headersToForward = [
        'authorization',
        'content-type',
        'x-request-id',
        'x-correlation-id',
      ];

      headersToForward.forEach((headerName) => {
        if (req.headers[headerName]) {
          headers[headerName] = String(req.headers[headerName]);
        }
      });

      // Make the proxy request
      const proxyResponse = await this.proxyService.proxy({
        method: req.method,
        path,
        headers,
        body: req.body,
      });

      // Send response back
      res.status(proxyResponse.status).json(proxyResponse.data);
    } catch (error) {
      console.error('Proxy error:', error);
      throw new HttpException(
        'Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
