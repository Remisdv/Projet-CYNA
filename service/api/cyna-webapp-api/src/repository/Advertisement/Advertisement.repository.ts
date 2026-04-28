import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextePromotionnel } from '../../database/entity/Advertisement/Advertisement.entity';

@Injectable()
export class AdvertisementRepository {
    constructor(
        @InjectRepository(TextePromotionnel)
        private readonly repo: Repository<TextePromotionnel>,
    ) { }

    findActive(): Promise<TextePromotionnel | null> {
        return this.repo.findOneBy({ isActive: true });
    }
}
