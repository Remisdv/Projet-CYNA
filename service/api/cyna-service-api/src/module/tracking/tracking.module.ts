import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingEventEntity } from '../../database/entity/tracking/tracking-event.entity';
import { TrackingService } from '../../service/tracking/tracking.service';
import { TrackingController } from '../../endpoint/tracking/tracking.controller';

@Module({
    imports: [TypeOrmModule.forFeature([TrackingEventEntity])],
    controllers: [TrackingController],
    providers: [TrackingService],
    exports: [TrackingService],
})
export class TrackingModule { }
