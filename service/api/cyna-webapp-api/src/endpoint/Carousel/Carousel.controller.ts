import { Controller, Get } from '@nestjs/common';
import { CarouselService } from '../../service/Carousel/Carousel.service';
import { CarouselItemDto } from '../../service/Carousel/dtos/Carousel.dto';

@Controller('carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) { }

  @Get()
  async findAll(): Promise<CarouselItemDto[]> {
    return this.carouselService.findAll();
  }
}
