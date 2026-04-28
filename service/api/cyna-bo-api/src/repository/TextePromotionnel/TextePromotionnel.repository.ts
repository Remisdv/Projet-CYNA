import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextePromotionnel } from '../../database/entity/TextePromotionnel/TextePromotionnel.entity';

@Injectable()
export class TextePromotionnelRepository {
    constructor(
        @InjectRepository(TextePromotionnel)
        private readonly repo: Repository<TextePromotionnel>,
    ) { }

    findAll(): Promise<TextePromotionnel[]> {
        return this.repo.find();
    }

    findById(id: string): Promise<TextePromotionnel | null> {
        return this.repo.findOneBy({ id });
    }

    findActive(): Promise<TextePromotionnel | null> {
        return this.repo.findOneBy({ isActive: true });
    }

    create(data: Partial<TextePromotionnel>): TextePromotionnel {
        return this.repo.create(data);
    }

    save(entity: TextePromotionnel): Promise<TextePromotionnel> {
        return this.repo.save(entity);
    }

    merge(entity: TextePromotionnel, patch: Partial<TextePromotionnel>): TextePromotionnel {
        return this.repo.merge(entity, patch);
    }

    async deleteById(id: string): Promise<number> {
        const result = await this.repo.delete(id);
        return result.affected ?? 0;
    }

    async deactivateAll(): Promise<void> {
        await this.repo.createQueryBuilder()
            .update(TextePromotionnel)
            .set({ isActive: false })
            .execute();
    }
}
