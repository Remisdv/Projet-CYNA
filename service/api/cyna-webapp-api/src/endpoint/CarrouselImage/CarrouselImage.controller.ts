import { Controller, Get } from '@nestjs/common';
import { CarrouselImageService } from '../../service/CarrouselImage/CarrouselImage.service';
import { CarrouselImageDto } from '../../service/dtos/CarrouselImage.dto';

@Controller('carrousel-image')
export class CarrouselImageController {
  constructor(private readonly service: CarrouselImageService) {}

  @Get('active')
  getActive(): Promise<CarrouselImageDto[]> {
    return this.service.findActive();
  }
}
