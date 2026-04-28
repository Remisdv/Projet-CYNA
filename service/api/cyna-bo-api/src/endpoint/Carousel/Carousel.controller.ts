import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CarouselService } from '../../service/Carousel/Carousel.service';
import { CarouselItemDto, CreateUpdateCarouselItemDto } from '../../service/Carousel/dtos/Carousel.dto';

@Controller('carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) { }

  @Get()
  async findAll(): Promise<CarouselItemDto[]> {
    return this.carouselService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CarouselItemDto> {
    return this.carouselService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateUpdateCarouselItemDto): Promise<CarouselItemDto> {
    return this.carouselService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateUpdateCarouselItemDto): Promise<CarouselItemDto> {
    return this.carouselService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.carouselService.delete(id);
  }
}
