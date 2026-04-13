import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Req,
  Res,
  Param,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../service/proxy.service';
import { Public, Roles } from '../common';
import { BaseProxyController } from './base-proxy.controller';

/**
 * Proxy /api/bo/services -> cyna-service-api /products
 * Maps camelCase front fields to snake_case service-api fields on write operations.
 */
@Controller('api/bo/services')
export class ServicesProxyController extends BaseProxyController {
  constructor(readonly proxyService: ProxyService) {
    super(proxyService);
  }

  private toSnakeCase(body: Record<string, any>): Record<string, any> {
    if (!body || typeof body !== 'object') return body;
    const map: Record<string, string> = {
      name: 'nom',
      shortDescription: 'description_courte',
      longDescription: 'description_longue',
      category: 'categorie',
      status: 'statut',
      monthlyPrice: 'prix_mensuel',
      annualPrice: 'prix_annuel',
      annualDiscountPct: 'remise_annuelle_pct',
      price: 'prix',
      stock: 'stock',
      unlimitedStock: 'stock_illimite',
      lowStockThreshold: 'seuil_alerte_stock',
      metaTitle: 'meta_title',
      metaDescription: 'meta_description',
      autoRenewal: 'renouvellement_auto',
      demoAvailable: 'demo_disponible',
      periodicity: 'periodicite',
    };
    const statusValues: Record<string, string> = { published: 'publi\u00e9', draft: 'brouillon' };
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(body)) {
      if (k === 'status') {
        result['statut'] = statusValues[v] ?? v;
      } else if (k === 'unlimitedStock') {
        if (v) result['stock_illimite'] = 'illimit\u00e9';
      } else {
        result[map[k] ?? k] = v;
      }
    }
    return result;
  }

  private toCamelCase(body: Record<string, any>): Record<string, any> {
    if (!body || typeof body !== 'object') return body;
    const map: Record<string, string> = {
      nom: 'name',
      description_courte: 'shortDescription',
      description_longue: 'longDescription',
      categorie: 'category',
      statut: 'status',
      prix_mensuel: 'monthlyPrice',
      prix_annuel: 'annualPrice',
      remise_annuelle_pct: 'annualDiscountPct',
      prix: 'price',
      stock_illimite: 'unlimitedStock',
      seuil_alerte_stock: 'lowStockThreshold',
      meta_title: 'metaTitle',
      meta_description: 'metaDescription',
      renouvellement_auto: 'autoRenewal',
      demo_disponible: 'demoAvailable',
      periodicite: 'periodicity',
      date_creation: 'createdAt',
      date_modification: 'updatedAt',
    };
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(body)) {
      const camelKey = map[k] ?? k;
      if (k === 'statut') {
        result['status'] = v === 'publi\u00e9' ? 'published' : 'draft';
      } else if (k === 'stock_illimite') {
        result['unlimitedStock'] = v === 'illimit\u00e9';
      } else {
        result[camelKey] = v;
      }
    }
    return result;
  }

  private async proxyWithMapping(
    req: Request,
    res: Response,
    path: string,
  ): Promise<void> {
    try {
      const headers: Record<string, string> = {};
      ['authorization', 'content-type', 'x-request-id'].forEach((h) => {
        if (req.headers[h]) headers[h] = String(req.headers[h]);
      });

      const body =
        req.method !== 'GET' && req.method !== 'HEAD' && req.body
          ? this.toSnakeCase(req.body)
          : undefined;

      const proxyResponse = await this.proxyService.proxy({
        method: req.method,
        path,
        headers,
        body,
      });

      const data =
        proxyResponse.data && typeof proxyResponse.data === 'object'
          ? Array.isArray(proxyResponse.data)
            ? proxyResponse.data.map((item: any) => this.toCamelCase(item))
            : proxyResponse.data.items
            ? { ...proxyResponse.data, items: proxyResponse.data.items.map((i: any) => this.toCamelCase(i)) }
            : this.toCamelCase(proxyResponse.data)
          : proxyResponse.data;

      if (data === '' || data === null || data === undefined) {
        res.status(proxyResponse.status).send();
      } else {
        res.status(proxyResponse.status).json(data);
      }
    } catch (error) {
      console.error('ServicesProxy error:', error);
      res.status(503).json({ message: 'Service unavailable' });
    }
  }

  @Get()
  @Roles('admin')
  async findAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sep = req.url.includes('?') ? '&' : '?';
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxyWithMapping(req, res, `/api/products${qs}${sep}statut=all`);
  }

  @Get('search')
  @Public()
  async search(@Req() req: Request, @Res() res: Response): Promise<void> {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    await this.proxyWithMapping(req, res, `/api/products/search${qs}`);
  }

  @Post('upload-images')
  @Roles('admin')
  async uploadImages(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, '/api/products/upload-images');
  }

  @Get(':id')
  @Public()
  async findById(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxyWithMapping(req, res, `/api/products/${id}`);
  }

  @Post()
  @Roles('admin')
  async create(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxyWithMapping(req, res, '/api/products');
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxyWithMapping(req, res, `/api/products/${id}`);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}`);
  }

  @Post(':id/publish')
  @Roles('admin')
  async publish(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/publish`);
  }

  @Post(':id/duplicate')
  @Roles('admin')
  async duplicate(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxyWithMapping(req, res, `/api/products/${id}/duplicate`);
  }

  @Post(':id/images')
  @Roles('admin')
  async addImages(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/images`);
  }

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

  @Put(':id/images/order')
  @Roles('admin')
  async reorderImages(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy(req, res, `/api/products/${id}/images/order`);
  }
}
