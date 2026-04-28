import { Injectable } from '@nestjs/common';
import { AdvertisementRepository } from '../../repository/Advertisement/Advertisement.repository';
import { AdvertisementMapper } from './mappers/Advertisement.mapper';
import { AdvertisementDto } from './dtos/Advertisement.dto';

@Injectable()
export class AdvertisementService {
  constructor(
    private readonly advertisementRepository: AdvertisementRepository,
    private readonly mapper: AdvertisementMapper,
  ) { }

  async findActive(): Promise<AdvertisementDto | null> {
    const texte = await this.advertisementRepository.findActive();
    if (!texte) return null;
    return this.mapper.toDto(texte);
  }

  async findAll(): Promise<AdvertisementDto[]> {
    const all = await this.advertisementRepository.findAll();
    return all.map((t) => this.mapper.toDto(t));
  }
}
