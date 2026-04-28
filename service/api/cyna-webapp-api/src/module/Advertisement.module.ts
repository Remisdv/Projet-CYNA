import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextePromotionnel } from '../database/entity/Advertisement/Advertisement.entity';
import { AdvertisementController } from '../endpoint/Advertisement/Advertisement.controller';
import { AdvertisementService } from '../service/Advertisement/Advertisement.service';
import { AdvertisementMapper } from '../service/Advertisement/mappers/Advertisement.mapper';
import { AdvertisementRepository } from '../repository/Advertisement/Advertisement.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TextePromotionnel])],
  controllers: [AdvertisementController],
  providers: [AdvertisementService, AdvertisementMapper, AdvertisementRepository],
})
export class AdvertisementModule { }
