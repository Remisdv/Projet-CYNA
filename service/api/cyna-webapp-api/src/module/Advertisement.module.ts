import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextePromotionnel } from '../database/entity/Advertisement/Advertisement.entity';
import { AdvertisementController } from '../endpoint/Advertisement/Advertisement.controller';
import { AdvertisementService } from '../service/Advertisement/Advertisement.service';
import { AdvertisementMapper } from '../service/mappers/Advertisement.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([TextePromotionnel])],
  controllers: [AdvertisementController],
  providers: [AdvertisementService, AdvertisementMapper],
})
export class AdvertisementModule {}
