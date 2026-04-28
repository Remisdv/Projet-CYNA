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
   * List products (public sees only published, admin sees all). Search via ?q=.
   */
  @Get()
  @Public()
  async findAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/products${qs}`);
  }

  /**
   * POST /api/products
   * Create product, or duplicate via ?from=:id (admin only).
   */
  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxy(req, res, `/api/products${qs}`);
  }

  /**
   * GET /api/products/:id
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
   * PUT /api/products/:id (full update, admin only)
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
   * PATCH /api/products/:id (partial update incl. publish via {statut})
   */
  @Patch(':id')
  @Roles('admin')
  async patchUpdate(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}`);
  }

  /**
   * DELETE /api/products/:id
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
   * POST /api/products/:id/demo-tokens (authenticated)
   */
  @Post(':id/demo-tokens')
  @Roles('')
  async generateDemo(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/demo-tokens`);
  }

  /**
   * POST /api/products/:id/images
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
   * PATCH /api/products/:id/images/:imageId
   * Partial image update (set main, change order)
   */
  @Patch(':id/images/:imageId')
  @Roles('admin')
  async patchImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/images/${imageId}`);
  }
}
