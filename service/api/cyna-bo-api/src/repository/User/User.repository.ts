import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../database/entity/User/User.entity';

export interface UserFilters {
    role?: string;
    status?: UserStatus;
    dateDebut?: Date;
    dateFin?: Date;
    sort?: string;
}

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) { }

    findById(id: string): Promise<User | null> {
        return this.repo.findOneBy({ id });
    }

    findByEmail(email: string): Promise<User | null> {
        return this.repo.findOneBy({ email });
    }

    create(data: Partial<User>): User {
        return this.repo.create(data);
    }

    save(entity: User): Promise<User> {
        return this.repo.save(entity);
    }

    merge(entity: User, patch: Partial<User>): User {
        return this.repo.merge(entity, patch);
    }

    async deleteById(id: string): Promise<number> {
        const result = await this.repo.delete(id);
        return result.affected ?? 0;
    }

    async findFiltered(
        page: number,
        limit: number,
        filters: UserFilters,
    ): Promise<{ items: User[]; total: number }> {
        const query = this.repo.createQueryBuilder('user');

        if (filters.role) {
            query.andWhere('user.role = :role', { role: filters.role });
        }
        if (filters.status) {
            query.andWhere('user.status = :status', { status: filters.status });
        }
        if (filters.dateDebut) {
            query.andWhere('user.createdAt >= :dateDebut', { dateDebut: filters.dateDebut });
        }
        if (filters.dateFin) {
            query.andWhere('user.createdAt <= :dateFin', { dateFin: filters.dateFin });
        }

        if (filters.sort) {
            const [field, direction] = filters.sort.split(':');
            query.orderBy(`user.${field}`, (direction?.toUpperCase() as 'ASC' | 'DESC') || 'ASC');
        } else {
            query.orderBy('user.createdAt', 'DESC');
        }

        query.skip((page - 1) * limit).take(limit);

        const [items, total] = await query.getManyAndCount();
        return { items, total };
    }
}
