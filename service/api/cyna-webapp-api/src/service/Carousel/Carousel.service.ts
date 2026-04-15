import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarouselItem } from '../../database/entity/Carousel/CarouselItem.entity';
import { CarouselMapper } from '../mappers/Carousel.mapper';
import { CarouselItemDto } from '../dtos/Carousel/Carousel.dto';

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
}
