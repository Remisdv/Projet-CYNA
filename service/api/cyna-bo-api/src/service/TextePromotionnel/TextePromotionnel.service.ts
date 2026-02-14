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

  findAll(): Promise<TextePromotionnel[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<TextePromotionnel> {
    const texte = await this.repo.findOneBy({ id });
    if (!texte) throw new NotFoundException(`Texte avec l'id ${id} introuvable`);
    return texte;
  }

  async findActive(): Promise<TextePromotionnel> {
    const texte = await this.repo.findOneBy({ isActive: true });
    if (!texte) throw new NotFoundException('Aucun texte actif trouvé');
    return texte;
  }

  create(data: Partial<TextePromotionnel>): Promise<TextePromotionnel> {
    const nouveauTexte = this.repo.create(data);
    return this.repo.save(nouveauTexte);
  }

  async update(id: number, data: Partial<TextePromotionnel>): Promise<TextePromotionnel> {
    const texte = await this.findOne(id);
    const updated = this.repo.merge(texte, data);
    return this.repo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Impossible de supprimer l'id ${id}`);
  }
}