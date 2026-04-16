import { Controller, Post, Body } from '@nestjs/common';
import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { TrackingService } from '../../service/tracking/tracking.service';
import { TrackingEventType } from '../../database/entity/tracking/tracking-event.entity';

class CreateTrackingEventDto {
    @IsEnum(['LOGIN', 'CART_ADD', 'CART_CHECKOUT', 'PAGE_VIEW'])
    type: TrackingEventType;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    sessionId?: string;

    @IsOptional()
    @IsObject()
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
