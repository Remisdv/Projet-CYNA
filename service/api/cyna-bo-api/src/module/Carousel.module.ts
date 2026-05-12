import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarouselItem } from '../database/entity/Carousel/CarouselItem.entity';
import { CarouselRepository } from '../repository/Carousel/Carousel.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CarouselItem])],
  providers: [CarouselRepository],
  exports: [CarouselRepository],
})
export class CarouselModule { }
