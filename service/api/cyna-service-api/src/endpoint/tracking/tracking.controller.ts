import { Controller, Post, Body } from '@nestjs/common';
import { TrackingService } from '../../service/tracking/tracking.service';
import { CreateTrackingEventDto } from '../../service/tracking/dtos/tracking.dto';

@Controller('tracking-events')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    @Post()
    async trackEvent(@Body() dto: CreateTrackingEventDto) {
        const event = await this.trackingService.track(dto);
        return { id: event.id };
    }
}
