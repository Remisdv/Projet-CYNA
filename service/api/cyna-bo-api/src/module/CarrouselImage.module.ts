import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarrouselImageController } from '../endpoint/CarrouselImage/CarrouselImage.controller';
import { CarrouselImageService } from '../service/CarrouselImage/CarrouselImage.service';
import { CarrouselImageMapper } from '../service/mappers/CarrouselImage.mapper';
import { CarrouselImages } from '../database/entity/CarrouselImages/CarrouselImages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarrouselImages])],
  controllers: [CarrouselImageController],
  providers: [CarrouselImageService, CarrouselImageMapper],
})
export class CarrouselImageModule {}
