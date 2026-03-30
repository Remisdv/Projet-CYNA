import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CarrouselImages {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    imageUrl: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    altText: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: false })
    isActive: boolean;
}