import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebappUser } from '../../database/entity/WebappUser/WebappUser.entity';

@Injectable()
export class AdminUsersService {
    constructor(
        @InjectRepository(WebappUser)
        private readonly userRepository: Repository<WebappUser>,
    ) { }

    async findAll(page: number, limit: number, sort?: string) {
        const order: Record<string, 'ASC' | 'DESC'> = {};
        if (sort === 'oldest') {
            order.createdAt = 'ASC';
        } else {
            order.createdAt = 'DESC';
        }

        const [items, total] = await this.userRepository.findAndCount({
            select: ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt'],
            order,
            skip: (page - 1) * limit,
            take: limit,
        });

        return { items, total, page, limit };
    }
}
