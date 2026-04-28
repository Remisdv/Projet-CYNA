import { Injectable, NotFoundException } from '@nestjs/common';
import { CarouselRepository } from '../../repository/Carousel/Carousel.repository';
import { CarouselMapper } from './mappers/Carousel.mapper';
import { CarouselItemDto, CreateUpdateCarouselItemDto } from './dtos/Carousel.dto';

@Injectable()
export class CarouselService {
  constructor(
    private readonly carouselRepository: CarouselRepository,
    private readonly mapper: CarouselMapper,
  ) { }

  async findAll(): Promise<CarouselItemDto[]> {
    const items = await this.carouselRepository.findAllOrdered();
    return this.mapper.toDtoArray(items);
  }

  async findOne(id: string): Promise<CarouselItemDto> {
    const item = await this.carouselRepository.findById(id);
    if (!item) throw new NotFoundException(`Carousel item with id ${id} not found`);
    return this.mapper.toDto(item);
  }

  async create(data: CreateUpdateCarouselItemDto): Promise<CarouselItemDto> {
    const entity = this.carouselRepository.create(this.mapper.toEntity(data));
    const saved = await this.carouselRepository.save(entity);
    return this.mapper.toDto(saved);
  }

  async update(id: string, data: CreateUpdateCarouselItemDto): Promise<CarouselItemDto> {
    const entity = await this.carouselRepository.findById(id);
    if (!entity) throw new NotFoundException(`Carousel item with id ${id} not found`);
    const updated = this.carouselRepository.merge(entity, this.mapper.toEntity(data));
    const saved = await this.carouselRepository.save(updated);
    return this.mapper.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.carouselRepository.findById(id);
    if (!entity) throw new NotFoundException(`Carousel item with id ${id} not found`);
    await this.carouselRepository.remove(entity);
  }
}
