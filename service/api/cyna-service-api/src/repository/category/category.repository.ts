import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../database/entity/category/category.entity';

@Injectable()
export class CategoryRepository {
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly repo: Repository<CategoryEntity>,
    ) { }

    findAllOrderedByName(): Promise<CategoryEntity[]> {
        return this.repo.find({ order: { nom: 'ASC' } });
    }

    findById(id: string): Promise<CategoryEntity | null> {
        return this.repo.findOneBy({ id });
    }

    findByName(nom: string): Promise<CategoryEntity | null> {
        return this.repo.findOneBy({ nom });
    }

    findBySlug(slug: string): Promise<CategoryEntity | null> {
        return this.repo.findOneBy({ slug });
    }

    save(entity: CategoryEntity): Promise<CategoryEntity> {
        return this.repo.save(entity);
    }

    async deleteById(id: string): Promise<number> {
        const result = await this.repo.delete(id);
        return result.affected ?? 0;
    }
}
