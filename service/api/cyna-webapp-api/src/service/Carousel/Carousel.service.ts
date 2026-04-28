import { Injectable } from '@nestjs/common';
import { CarouselRepository } from '../../repository/Carousel/Carousel.repository';
import { CarouselMapper } from './mappers/Carousel.mapper';
import { CarouselItemDto } from './dtos/Carousel.dto';

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
}
