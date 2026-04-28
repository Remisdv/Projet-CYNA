import { Injectable, NotFoundException } from '@nestjs/common';
import { TextePromotionnelRepository } from '../../repository/TextePromotionnel/TextePromotionnel.repository';
import { TextePromotionnelMapper } from './mappers/TextePromotionnel.mapper';
import { TextePromotionnelDto, CreateUpdateTextePromotionnelDto, PatchTextePromotionnelDto } from './dtos/TextePromotionnel.dto';

@Injectable()
export class TextePromotionnelService {
  constructor(
    private readonly textePromotionnelRepository: TextePromotionnelRepository,
    private readonly mapper: TextePromotionnelMapper,
  ) { }

  async findAll(): Promise<TextePromotionnelDto[]> {
    const textes = await this.textePromotionnelRepository.findAll();
    return this.mapper.toDtoArray(textes);
  }

  async findAllActive(): Promise<TextePromotionnelDto[]> {
    const texte = await this.textePromotionnelRepository.findActive();
    return texte ? [this.mapper.toDto(texte)] : [];
  }

  async findOne(id: string): Promise<TextePromotionnelDto> {
    const texte = await this.textePromotionnelRepository.findById(id);
    if (!texte) throw new NotFoundException(`Texte avec l'id ${id} introuvable`);
    return this.mapper.toDto(texte);
  }

  async create(data: CreateUpdateTextePromotionnelDto): Promise<TextePromotionnelDto> {
    const entity = this.mapper.toEntity(data);
    const nouveauTexte = this.textePromotionnelRepository.create(entity);
    const saved = await this.textePromotionnelRepository.save(nouveauTexte);
    return this.mapper.toDto(saved);
  }

  async update(id: string, data: CreateUpdateTextePromotionnelDto): Promise<TextePromotionnelDto> {
    const entity = await this.textePromotionnelRepository.findById(id);
    if (!entity) throw new NotFoundException(`Texte avec l'id ${id} introuvable`);
    if (data.isActive === true) {
      await this.textePromotionnelRepository.deactivateAll();
    }
    const mappedData = this.mapper.toEntity(data);
    const updated = this.textePromotionnelRepository.merge(entity, mappedData);
    const saved = await this.textePromotionnelRepository.save(updated);
    return this.mapper.toDto(saved);
  }

  async patchUpdate(id: string, data: PatchTextePromotionnelDto): Promise<TextePromotionnelDto> {
    const entity = await this.textePromotionnelRepository.findById(id);
    if (!entity) throw new NotFoundException(`Texte avec l'id ${id} introuvable`);
    if (data.isActive === true) {
      await this.textePromotionnelRepository.deactivateAll();
    }
    if (data.textFr !== undefined) entity.textFr = data.textFr;
    if (data.textEn !== undefined) entity.textEn = data.textEn;
    if (data.isActive !== undefined) entity.isActive = data.isActive;
    const saved = await this.textePromotionnelRepository.save(entity);
    return this.mapper.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const affected = await this.textePromotionnelRepository.deleteById(id);
    if (affected === 0) throw new NotFoundException(`Impossible de supprimer l'id ${id}`);
  }
}