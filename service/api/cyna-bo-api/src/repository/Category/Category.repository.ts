import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entity/Category/Category.entity';

@Injectable()
export class CategoryRepository {
    constructor(
        @InjectRepository(Category)
        private readonly repo: Repository<Category>,
    ) { }

    findAllOrdered(): Promise<Category[]> {
        return this.repo.find({ order: { createdAt: 'ASC' } });
    }

    findById(id: string): Promise<Category | null> {
        return this.repo.findOneBy({ id });
    }

    create(data: Partial<Category>): Category {
        return this.repo.create(data);
    }

    save(entity: Category): Promise<Category> {
        return this.repo.save(entity);
    }

    merge(entity: Category, patch: Partial<Category>): Category {
        return this.repo.merge(entity, patch);
    }

    remove(entity: Category): Promise<Category> {
        return this.repo.remove(entity);
    }
}
