import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextePromotionnel } from '../../database/entity/Advertisement/Advertisement.entity';
import { AdvertisementMapper } from '../../mapper/Advertisement.mapper';
import { AdvertisementDto } from '../../dto/Advertisement/Advertisement.dto';

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectRepository(TextePromotionnel)
    private readonly repo: Repository<TextePromotionnel>,
    private readonly mapper: AdvertisementMapper,
  ) { }

  async findActive(): Promise<AdvertisementDto | null> {
    const texte = await this.repo.findOneBy({ isActive: true });
    if (!texte) return null;
    return this.mapper.toDto(texte);
  }
}
