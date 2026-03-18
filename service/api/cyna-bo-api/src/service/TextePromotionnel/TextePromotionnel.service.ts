import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextePromotionnel } from '../../database/entity/TextePromotionnel/TextePromotionnel.entity';
import { TextePromotionnelMapper } from '../mappers/TextePromotionnel.mapper';
import { TextePromotionnelDto, CreateUpdateTextePromotionnelDto } from '../dtos/TextPromotionnel/TextePromotionnel.dto';

@Injectable()
export class TextePromotionnelService {
  constructor(
    @InjectRepository(TextePromotionnel)
    private readonly repo: Repository<TextePromotionnel>,
    private readonly mapper: TextePromotionnelMapper,
  ) {}

  async findAll(): Promise<TextePromotionnelDto[]> {
    const textes = await this.repo.find();
    return this.mapper.toDtoArray(textes);
  }

  async findOne(id: number): Promise<TextePromotionnelDto> {
    const texte = await this.repo.findOneBy({ id });
    if (!texte) throw new NotFoundException(`Texte avec l'id ${id} introuvable`);
    return this.mapper.toDto(texte);
  }

  async findActive(): Promise<TextePromotionnelDto> {
    const texte = await this.repo.findOneBy({ isActive: true });
    if (!texte) throw new NotFoundException('Aucun texte actif trouvé');
    return this.mapper.toDto(texte);
  }

  async create(data: CreateUpdateTextePromotionnelDto): Promise<TextePromotionnelDto> {
    const entity = this.mapper.toEntity(data);
    const nouveauTexte = this.repo.create(entity);
    const saved = await this.repo.save(nouveauTexte);
    return this.mapper.toDto(saved);
  }

  async update(id: number, data: CreateUpdateTextePromotionnelDto): Promise<TextePromotionnelDto> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Texte avec l'id ${id} introuvable`);
    const mappedData = this.mapper.toEntity(data);
    const updated = this.repo.merge(entity, mappedData);
    const saved = await this.repo.save(updated);
    return this.mapper.toDto(saved);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Impossible de supprimer l'id ${id}`);
  }
}