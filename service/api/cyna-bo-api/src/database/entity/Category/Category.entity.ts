import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  nameFr: string;

  @Column({ type: 'text', nullable: true })
  descFr: string;

  @Column({ type: 'varchar', length: 255 })
  nameEn: string;

  @Column({ type: 'text', nullable: true })
  descEn: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
