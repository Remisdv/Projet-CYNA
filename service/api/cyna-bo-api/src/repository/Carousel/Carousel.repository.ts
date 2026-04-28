import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarouselItem } from '../../database/entity/Carousel/CarouselItem.entity';

@Injectable()
export class CarouselRepository {
    constructor(
        @InjectRepository(CarouselItem)
        private readonly repo: Repository<CarouselItem>,
    ) { }

    findAllOrdered(): Promise<CarouselItem[]> {
        return this.repo.find({ order: { order: 'ASC' } });
    }

    findById(id: string): Promise<CarouselItem | null> {
        return this.repo.findOneBy({ id });
    }

    create(data: Partial<CarouselItem>): CarouselItem {
        return this.repo.create(data);
    }

    save(entity: CarouselItem): Promise<CarouselItem> {
        return this.repo.save(entity);
    }

    merge(entity: CarouselItem, patch: Partial<CarouselItem>): CarouselItem {
        return this.repo.merge(entity, patch);
    }

    remove(entity: CarouselItem): Promise<CarouselItem> {
        return this.repo.remove(entity);
    }
}
