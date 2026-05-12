import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { WebappUser, WebappUserStatus } from '../../database/entity/WebappUser/WebappUser.entity';

export interface WebappUserAdminFilters {
    status?: WebappUserStatus;
    search?: string;
    dateDebut?: Date;
    dateFin?: Date;
    sort?: string;
}

@Injectable()
export class WebappUserAdminRepository {
    constructor(
        @InjectRepository(WebappUser)
        private readonly repo: Repository<WebappUser>,
    ) { }

    async findFiltered(
        page: number,
        limit: number,
        filters: WebappUserAdminFilters,
    ): Promise<{ items: WebappUser[]; total: number }> {
        const qb = this.repo.createQueryBuilder('u');

        if (filters.status) {
            qb.andWhere('u.status = :status', { status: filters.status });
        }
        if (filters.search) {
            qb.andWhere(
                '(u.email ILIKE :s OR u.firstName ILIKE :s OR u.lastName ILIKE :s)',
                { s: `%${filters.search}%` },
            );
        }
        if (filters.dateDebut) {
            qb.andWhere('u.createdAt >= :dateDebut', { dateDebut: filters.dateDebut });
        }
        if (filters.dateFin) {
            qb.andWhere('u.createdAt <= :dateFin', { dateFin: filters.dateFin });
        }

        const allowedSortFields = new Set([
            'createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'status',
        ]);
        if (filters.sort) {
            const [field, direction] = filters.sort.split(':');
            if (allowedSortFields.has(field)) {
                qb.orderBy(`u.${field}`, (direction?.toUpperCase() as 'ASC' | 'DESC') || 'ASC');
            } else {
                qb.orderBy('u.createdAt', 'DESC');
            }
        } else {
            qb.orderBy('u.createdAt', 'DESC');
        }

        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }

    findById(id: string): Promise<WebappUser | null> {
        return this.repo.findOneBy({ id });
    }

    findByEmail(email: string): Promise<WebappUser | null> {
        return this.repo.findOneBy({ email });
    }

    create(data: Partial<WebappUser>): WebappUser {
        return this.repo.create(data);
    }

    save(entity: WebappUser): Promise<WebappUser> {
        return this.repo.save(entity);
    }

    merge(entity: WebappUser, patch: Partial<WebappUser>): WebappUser {
        return this.repo.merge(entity, patch);
    }

    async deleteById(id: string): Promise<number> {
        const result = await this.repo.delete(id);
        return result.affected ?? 0;
    }
}
