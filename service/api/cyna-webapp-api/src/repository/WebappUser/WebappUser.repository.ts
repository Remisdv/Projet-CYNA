import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebappUser } from '../../database/entity/WebappUser/WebappUser.entity';

@Injectable()
export class WebappUserRepository {
    constructor(
        @InjectRepository(WebappUser)
        private readonly repo: Repository<WebappUser>,
    ) { }

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

    findAdminPaginated(
        page: number,
        limit: number,
        sort?: string,
    ): Promise<[Pick<WebappUser, 'id' | 'email' | 'firstName' | 'lastName' | 'status' | 'createdAt'>[], number]> {
        const order: Record<string, 'ASC' | 'DESC'> = {};
        if (sort === 'oldest') {
            order.createdAt = 'ASC';
        } else {
            order.createdAt = 'DESC';
        }
        return this.repo.findAndCount({
            select: ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt'],
            order,
            skip: (page - 1) * limit,
            take: limit,
        });
    }
}
