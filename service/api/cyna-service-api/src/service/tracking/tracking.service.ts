import { Injectable } from '@nestjs/common';
import {
    TrackingEventEntity,
    TrackingEventType,
} from '../../database/entity/tracking/tracking-event.entity';
import { TrackingRepository } from '../../repository/tracking/tracking.repository';

@Injectable()
export class TrackingService {
    constructor(private readonly trackingRepository: TrackingRepository) { }

    async track(data: {
        type: TrackingEventType;
        userId?: string;
        sessionId?: string;
        metadata?: Record<string, any>;
    }): Promise<TrackingEventEntity> {
        const event = this.trackingRepository.create(data);
        return this.trackingRepository.save(event);
    }

    async countByType(type: TrackingEventType, since: Date): Promise<number> {
        return this.trackingRepository.countByTypeSince(type, since);
    }
}
