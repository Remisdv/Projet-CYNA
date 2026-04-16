import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ref: string;

  @Column()
  clientEmail: string;

  @Column({ nullable: true })
  clientFirstName: string;

  @Column({ nullable: true })
  clientLastName: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  paymentRef: string;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };

  @Column({ type: 'jsonb', default: '[]' })
  items: Array<{
    id?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ type: 'jsonb', default: '[]' })
  history: Array<{
    id?: string;
    action: string;
    date: string;
    by: string;
  }>;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
