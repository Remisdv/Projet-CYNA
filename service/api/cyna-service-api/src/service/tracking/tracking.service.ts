import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    TrackingEventEntity,
    TrackingEventType,
} from '../../database/entity/tracking/tracking-event.entity';

@Injectable()
export class TrackingService {
    constructor(
        @InjectRepository(TrackingEventEntity)
        private readonly repo: Repository<TrackingEventEntity>,
    ) { }

    async track(data: {
        type: TrackingEventType;
        userId?: string;
        sessionId?: string;
        metadata?: Record<string, any>;
    }): Promise<TrackingEventEntity> {
        const event = this.repo.create(data);
        return this.repo.save(event);
    }

    async countByType(type: TrackingEventType, since: Date): Promise<number> {
        return this.repo
            .createQueryBuilder('te')
            .where('te.type = :type', { type })
            .andWhere('te."createdAt" >= :since', { since })
            .getCount();
    }
}
