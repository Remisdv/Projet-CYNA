import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarrouselImages } from '../../database/entity/CarrouselImages/CarrouselImages.entity';
import { CarrouselImageDto } from '../dtos/CarrouselImage.dto';

@Injectable()
export class CarrouselImageService {
  constructor(
    @InjectRepository(CarrouselImages)
    private readonly repo: Repository<CarrouselImages>,
  ) {}

  async findActive(): Promise<CarrouselImageDto[]> {
    const images = await this.repo.findBy({ isActive: true });
    return images.map(image => {
      const dto = new CarrouselImageDto();
      dto.id = image.id;
      dto.imageUrl = image.imageUrl;
      dto.altText = image.altText;
      dto.isActive = image.isActive;
      dto.createdAt = image.createdAt;
      return dto;
    });
  }
}
