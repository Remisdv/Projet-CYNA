import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    TrackingEventEntity,
    TrackingEventType,
} from '../../database/entity/tracking/tracking-event.entity';

@Injectable()
export class TrackingRepository {
    constructor(
        @InjectRepository(TrackingEventEntity)
        private readonly repo: Repository<TrackingEventEntity>,
    ) { }

    create(data: Partial<TrackingEventEntity>): TrackingEventEntity {
        return this.repo.create(data);
    }

    save(entity: TrackingEventEntity): Promise<TrackingEventEntity> {
        return this.repo.save(entity);
    }

    countByTypeSince(type: TrackingEventType, since: Date): Promise<number> {
        return this.repo
            .createQueryBuilder('te')
            .where('te.type = :type', { type })
            .andWhere('te."createdAt" >= :since', { since })
            .getCount();
    }
}
