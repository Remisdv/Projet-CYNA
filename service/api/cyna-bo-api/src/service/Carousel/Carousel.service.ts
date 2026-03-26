import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarouselItem } from '../../database/entity/Carousel/CarouselItem.entity';
import { CarouselMapper } from '../mappers/Carousel.mapper';
import { CarouselItemDto, CreateUpdateCarouselItemDto } from '../dtos/Carousel/Carousel.dto';

@Injectable()
export class CarouselService {
  constructor(
    @InjectRepository(CarouselItem)
    private readonly repo: Repository<CarouselItem>,
    private readonly mapper: CarouselMapper,
  ) {}

  async findAll(): Promise<CarouselItemDto[]> {
    const items = await this.repo.find({ order: { order: 'ASC' } });
    return this.mapper.toDtoArray(items);
  }

  async findOne(id: string): Promise<CarouselItemDto> {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException(`Carousel item with id ${id} not found`);
    return this.mapper.toDto(item);
  }

  async create(data: CreateUpdateCarouselItemDto): Promise<CarouselItemDto> {
    const entity = this.repo.create(this.mapper.toEntity(data));
    const saved = await this.repo.save(entity);
    return this.mapper.toDto(saved);
  }

  async update(id: string, data: CreateUpdateCarouselItemDto): Promise<CarouselItemDto> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Carousel item with id ${id} not found`);
    const updated = this.repo.merge(entity, this.mapper.toEntity(data));
    const saved = await this.repo.save(updated);
    return this.mapper.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Carousel item with id ${id} not found`);
    await this.repo.remove(entity);
  }
}
