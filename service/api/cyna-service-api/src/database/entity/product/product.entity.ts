import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ProductCategory {
  SOC = 'SOC',
  EDR = 'EDR',
  XDR = 'XDR',
  SERVICE = 'Service',
}

export enum ProductType {
  PRODUCT = 'produit',
  SERVICE = 'service',
}

export enum ProductStatus {
  DRAFT = 'brouillon',
  PUBLISHED = 'publié',
}

export enum ServicePeriodicity {
  MONTHLY = 'mensuel',
  QUARTERLY = 'trimestriel',
  ANNUAL = 'annuel',
}

@Entity('products')
@Index('IDX_products_slug', ['slug'])
@Index('IDX_products_status', ['statut'])
@Index('IDX_products_category', ['categorie'])
@Index('IDX_products_type', ['type'])
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  description_courte: string;

  @Column({ type: 'text', nullable: true })
  description_longue: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  categorie: ProductCategory;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  tags: string[];

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  statut: ProductStatus;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  slug: string;

  // SEO Fields
  @Column({
    type: 'varchar',
    length: 60,
    nullable: true,
  })
  meta_title: string;

  @Column({
    type: 'varchar',
    length: 160,
    nullable: true,
  })
  meta_description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  keywords: string;

  // Product-specific fields
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  prix: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  stock: number;

  @Column({
    type: 'varchar',
    default: 'illimité',
    nullable: true,
  })
  stock_illimite: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  seuil_alerte_stock: number;

  // Service-specific fields
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  prix_mensuel: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  prix_annuel: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  remise_annuelle_pct: number;

  @Column({
    type: 'enum',
    enum: ServicePeriodicity,
    nullable: true,
  })
  periodicite: ServicePeriodicity;

  @Column({
    type: 'boolean',
    default: true,
    nullable: true,
  })
  renouvellement_auto: boolean;

  @Column({
    type: 'boolean',
    default: true,
    nullable: true,
  })
  demo_disponible: boolean;

  // Images (stored as JSON array)
  @Column({
    type: 'jsonb',
    nullable: true,
    default: '[]',
  })
  images: Array<{
    id: string;
    url: string;
    est_principale: boolean;
    ordre: number;
  }>;

  @CreateDateColumn()
  date_creation: Date;

  @UpdateDateColumn()
  date_modification: Date;
}
