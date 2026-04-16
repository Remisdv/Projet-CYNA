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
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  productId: string;
  productName: string;
  productType: 'produit' | 'service';
  quantity: number;
  unitPrice: number;
  periodicity?: 'mensuel' | 'annuel';
  subtotal: number;
}

@Entity('customer_orders')
export class CustomerOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  ref: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'jsonb' })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'jsonb' })
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    company?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    company?: string;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
