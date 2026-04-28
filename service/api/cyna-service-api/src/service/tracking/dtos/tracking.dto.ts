import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { TrackingEventType } from '../../../database/entity/tracking/tracking-event.entity';

export class CreateTrackingEventDto {
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
