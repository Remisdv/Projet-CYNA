import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column({ default: 'produit' })
  productType: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prix: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prixMensuel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prixAnnuel: number;

  @Column({ nullable: true })
  periodicity: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'boolean', default: false })
  stockReserved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reservationExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
