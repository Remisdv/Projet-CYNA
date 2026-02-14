import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarrouselImages } from '../../database/entity/CarrouselImages/CarrouselImages.entity';
import { CarrouselImageMapper } from '../mappers/CarrouselImage.mapper';
import { CarrouselImageDto, CreateUpdateCarrouselImageDto } from '../dtos/CarrouselImage.dto';

@Injectable()
export class CarrouselImageService {
  constructor(
    @InjectRepository(CarrouselImages)
    private readonly repo: Repository<CarrouselImages>,
    private readonly mapper: CarrouselImageMapper,
  ) {}

  async findAll(): Promise<CarrouselImageDto[]> {
    const images = await this.repo.find();
    return this.mapper.toDtoArray(images);
  }

  async findOne(id: number): Promise<CarrouselImageDto> {
    const image = await this.repo.findOneBy({ id });
    if (!image) throw new NotFoundException(`Image avec l'id ${id} introuvable`);
    return this.mapper.toDto(image);
  }

  async findActive(): Promise<CarrouselImageDto[]> {
    const images = await this.repo.findBy({ isActive: true });
    return this.mapper.toDtoArray(images);
  }

  async create(data: CreateUpdateCarrouselImageDto): Promise<CarrouselImageDto> {
    const entity = this.mapper.toEntity(data);
    const newImage = this.repo.create(entity);
    const saved = await this.repo.save(newImage);
    return this.mapper.toDto(saved);
  }

  async update(id: number, data: CreateUpdateCarrouselImageDto): Promise<CarrouselImageDto> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Image avec l'id ${id} introuvable`);
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
