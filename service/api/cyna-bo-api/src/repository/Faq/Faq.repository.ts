import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../../database/entity/Faq/Faq.entity';

@Injectable()
export class FaqRepository {
    constructor(
        @InjectRepository(Faq)
        private readonly repo: Repository<Faq>,
    ) { }

    findById(id: string): Promise<Faq | null> {
        return this.repo.findOneBy({ id });
    }

    findOrdered(lang?: string): Promise<Faq[]> {
        const where = lang ? { lang } : {};
        return this.repo.find({ where, order: { order: 'ASC' } });
    }

    create(data: Partial<Faq>): Faq {
        return this.repo.create(data);
    }

    save(entity: Faq): Promise<Faq> {
        return this.repo.save(entity);
    }

    merge(entity: Faq, patch: Partial<Faq>): Faq {
        return this.repo.merge(entity, patch);
    }

    remove(entity: Faq): Promise<Faq> {
        return this.repo.remove(entity);
    }
}
