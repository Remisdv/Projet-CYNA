import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ServiceStatus {
  DRAFT = 'brouillon',
  PUBLISHED = 'publi\u00e9',
}

@Entity('services')
@Index('IDX_services_slug', ['slug'])
@Index('IDX_services_status', ['statut'])
@Index('IDX_services_category', ['categoryId'])
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'varchar', length: 255 })
  categoryId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.DRAFT,
  })
  statut: ServiceStatus;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
