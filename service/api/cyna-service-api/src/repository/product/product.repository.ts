import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductEntity, ProductStatus, ProductType } from '../../database/entity/product';

export interface ProductFilters {
    page: number;
    per_page: number;
    categorie?: string;
    type?: ProductType;
    statut?: ProductStatus | 'all';
    prix_min?: number;
    prix_max?: number;
    disponible?: boolean;
    sort?: string;
}

@Injectable()
export class ProductRepository {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly repo: Repository<ProductEntity>,
    ) { }

    findById(id: string): Promise<ProductEntity | null> {
        return this.repo.findOne({ where: { id } });
    }

    findBySlug(slug: string): Promise<ProductEntity | null> {
        return this.repo.findOne({ where: { slug } });
    }

    /**
     * Encapsulates the public listing query: status filter (default PUBLISHED),
     * category UUID filter, type, availability, price range, sorting and pagination.
     * Caller is expected to have resolved any category slug to a UUID before
     * calling — this method only knows about UUIDs.
     */
    async findFiltered(
        filters: ProductFilters,
    ): Promise<{ data: ProductEntity[]; total: number }> {
        const { page, per_page, sort } = filters;
        const skip = (page - 1) * per_page;

        let qb = this.repo.createQueryBuilder('product');

        if (filters.statut === 'all') {
            // No status filter: admin sees all statuses
        } else if (filters.statut) {
            qb = qb.where('product.statut = :statut', { statut: filters.statut });
        } else {
            qb = qb.where('product.statut = :statut', { statut: ProductStatus.PUBLISHED });
        }

        if (filters.categorie) {
            qb = qb.andWhere('product.categorie = :categorie', { categorie: filters.categorie });
        }

        if (filters.type) {
            qb = qb.andWhere('product.type = :type', { type: filters.type });
        }

        if (filters.disponible !== undefined && filters.disponible) {
            qb = qb.andWhere('(product.stock > 0 OR product.stock_illimite = :illimite)', {
                illimite: 'illimit\u00e9',
            });
        }

        if (Number.isFinite(filters.prix_min)) {
            qb = qb.andWhere('(product.prix >= :prix_min OR product.prix_mensuel >= :prix_min)', {
                prix_min: filters.prix_min,
            });
        }

        if (Number.isFinite(filters.prix_max)) {
            qb = qb.andWhere('(product.prix <= :prix_max OR product.prix_mensuel <= :prix_max)', {
                prix_max: filters.prix_max,
            });
        }

        switch (sort) {
            case 'prix_asc':
                qb = qb.orderBy('COALESCE(product.prix, product.prix_mensuel)', 'ASC');
                break;
            case 'prix_desc':
                qb = qb.orderBy('COALESCE(product.prix, product.prix_mensuel)', 'DESC');
                break;
            case 'nouveautes':
                qb = qb.orderBy('product.date_creation', 'DESC');
                break;
            case 'featured':
            default:
                qb = qb.orderBy('product.date_modification', 'DESC');
        }

        const [data, total] = await qb.skip(skip).take(per_page).getManyAndCount();
        return { data, total };
    }

    /**
     * Search fallback for when Elasticsearch is unavailable: ILIKE on a few text
     * fields, optionally restricted by category and type.
     */
    async searchFallback(
        q: string,
        options: { categorie?: string; type?: string } = {},
    ): Promise<{ data: ProductEntity[]; total: number }> {
        const qb = this.repo.createQueryBuilder('product');
        qb.where('product.statut = :statut', { statut: ProductStatus.PUBLISHED });

        if (q) {
            qb.andWhere(
                '(product.nom ILIKE :q OR product.description_courte ILIKE :q OR product.description_longue ILIKE :q OR product.tags::text ILIKE :q)',
                { q: `%${q}%` },
            );
        }

        if (options.categorie) {
            qb.andWhere('product.categorie = :categorie', { categorie: options.categorie });
        }

        if (options.type) {
            qb.andWhere('product.type = :type', { type: options.type });
        }

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }

    findManyPublishedByIds(ids: string[]): Promise<ProductEntity[]> {
        return this.repo.findBy({ id: In(ids), statut: ProductStatus.PUBLISHED });
    }

    findAllPublished(): Promise<ProductEntity[]> {
        return this.repo.find({ where: { statut: ProductStatus.PUBLISHED } });
    }

    findLowStock(threshold: number, limit: number): Promise<ProductEntity[]> {
        return this.repo
            .createQueryBuilder('p')
            .select(['p.id', 'p.nom', 'p.stock'])
            .where('p.stock IS NOT NULL')
            .andWhere("(p.stock_illimite IS NULL OR p.stock_illimite <> 'illimité')")
            .andWhere('p.stock <= COALESCE(p.seuil_alerte_stock, :threshold)', { threshold })
            .andWhere('p.statut = :status', { status: ProductStatus.PUBLISHED })
            .orderBy('p.stock', 'ASC')
            .limit(limit)
            .getMany();
    }

    save(entity: ProductEntity): Promise<ProductEntity> {
        return this.repo.save(entity);
    }

    remove(entity: ProductEntity): Promise<ProductEntity> {
        return this.repo.remove(entity);
    }
}
