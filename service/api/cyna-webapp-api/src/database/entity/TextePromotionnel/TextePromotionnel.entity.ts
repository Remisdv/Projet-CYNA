import { Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
 } from 'typeorm';

@Entity()
export class TextePromotionnel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column( { type: 'varchar', length: 16 } )
    titre: string;

    @Column( { type: 'varchar', length: 128 } )
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column( { default: false } )
    isActive: boolean;
}