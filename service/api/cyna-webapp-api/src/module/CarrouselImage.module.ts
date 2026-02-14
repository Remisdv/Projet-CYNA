import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarrouselImageController } from '../endpoint/CarrouselImage/CarrouselImage.controller';
import { CarrouselImageService } from '../service/CarrouselImage/CarrouselImage.service';
import { CarrouselImages } from '../database/entity/CarrouselImages/CarrouselImages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarrouselImages])],
  controllers: [CarrouselImageController],
  providers: [CarrouselImageService],
})
export class CarrouselImageModule {}
