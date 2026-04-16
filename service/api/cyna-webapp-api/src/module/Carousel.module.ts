import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarouselItem } from '../database/entity/Carousel/CarouselItem.entity';
import { CarouselController } from '../endpoint/Carousel/Carousel.controller';
import { CarouselService } from '../service/Carousel/Carousel.service';
import { CarouselMapper } from '../mapper/Carousel.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([CarouselItem])],
  controllers: [CarouselController],
  providers: [CarouselService, CarouselMapper],
})
export class CarouselModule { }
