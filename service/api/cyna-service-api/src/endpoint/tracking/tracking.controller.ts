import { Controller, Post, Body } from '@nestjs/common';
import { TrackingService } from '../../service/tracking/tracking.service';
import { TrackingEventType } from '../../database/entity/tracking/tracking-event.entity';

class CreateTrackingEventDto {
    type: TrackingEventType;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
}

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    @Post('event')
    async trackEvent(@Body() dto: CreateTrackingEventDto) {
        const event = await this.trackingService.track(dto);
        return { id: event.id };
    }
}
