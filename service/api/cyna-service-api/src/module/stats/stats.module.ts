import { Module } from '@nestjs/common';
import { StatsService } from '../../service/stats/stats.service';
import { StatsController } from '../../endpoint/stats/stats.controller';
import { TrackingModule } from '../tracking/tracking.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    OrderModule,
    ProductModule,
    TrackingModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule { }
