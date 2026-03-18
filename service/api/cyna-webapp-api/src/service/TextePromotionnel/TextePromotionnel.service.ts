import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextePromotionnel } from '../../database/entity/TextePromotionnel/TextePromotionnel.entity';

@Injectable()
export class TextePromotionnelService {
  constructor(
    @InjectRepository(TextePromotionnel)
    private readonly repo: Repository<TextePromotionnel>,
  ) {}

  
  async findActive(): Promise<TextePromotionnel> {
    const texte = await this.repo.findOneBy({ isActive: true });
    if (!texte) throw new NotFoundException('Aucun texte actif trouvé');
    return texte;
  }
}