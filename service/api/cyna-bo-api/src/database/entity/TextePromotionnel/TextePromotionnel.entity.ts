import { Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
 } from 'typeorm';

@Entity()
export class TextePromotionnel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column( { type: 'varchar', length: 500 } )
    textFr: string;

    @Column( { type: 'varchar', length: 500 } )
    textEn: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column( { default: false } )
    isActive: boolean;
}