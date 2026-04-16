import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../database/entity/order';
import { ProductEntity } from '../../database/entity/product';
import { StatsService } from '../../service/stats/stats.service';
import { StatsController } from '../../endpoint/stats/stats.controller';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, ProductEntity]),
    TrackingModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule { }
