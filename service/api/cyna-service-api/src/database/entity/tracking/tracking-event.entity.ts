import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

export enum TrackingEventType {
    LOGIN = 'LOGIN',
    CART_ADD = 'CART_ADD',
    CART_CHECKOUT = 'CART_CHECKOUT',
    PAGE_VIEW = 'PAGE_VIEW',
}

@Entity('tracking_events')
@Index(['type', 'createdAt'])
export class TrackingEventEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: TrackingEventType })
    type: TrackingEventType;

    @Column({ nullable: true })
    userId: string;

    @Column({ nullable: true })
    sessionId: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;
}
