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
}
