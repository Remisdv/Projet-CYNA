import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity, ServiceStatus } from '../../database/entity/service/service.entity';

export interface ServiceFilters {
    page: number;
    per_page: number;
    categorie?: string;
    statut?: ServiceStatus;
    sort?: string;
}

@Injectable()
export class ServiceRepository {
    constructor(
        @InjectRepository(ServiceEntity)
        private readonly repo: Repository<ServiceEntity>,
    ) { }

    findById(id: string): Promise<ServiceEntity | null> {
        return this.repo.findOneBy({ id });
    }

    findBySlug(slug: string): Promise<ServiceEntity | null> {
        return this.repo.findOneBy({ slug });
    }

    async findFiltered(
        filters: ServiceFilters,
    ): Promise<{ data: ServiceEntity[]; total: number }> {
        const { page, per_page, sort } = filters;
        const skip = (page - 1) * per_page;

        let qb = this.repo.createQueryBuilder('service');

        if (filters.categorie) {
            qb = qb.andWhere('service.categoryId = :categorie', { categorie: filters.categorie });
        }

        if (filters.statut) {
            qb = qb.andWhere('service.statut = :statut', { statut: filters.statut });
        }

        if (sort) {
            const [field, direction] = sort.split(':');
            qb = qb.orderBy(`service.${field}`, (direction?.toUpperCase() as 'ASC' | 'DESC') || 'ASC');
        } else {
            qb = qb.orderBy('service.createdAt', 'DESC');
        }

        qb = qb.skip(skip).take(per_page);

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }

    save(entity: ServiceEntity): Promise<ServiceEntity> {
        return this.repo.save(entity);
    }

    async deleteById(id: string): Promise<number> {
        const result = await this.repo.delete(id);
        return result.affected ?? 0;
    }
}
