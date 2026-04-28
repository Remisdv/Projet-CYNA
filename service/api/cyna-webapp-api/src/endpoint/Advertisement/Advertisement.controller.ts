import { Controller, Get } from '@nestjs/common';
import { AdvertisementService } from '../../service/Advertisement/Advertisement.service';
import { AdvertisementDto } from '../../service/Advertisement/dtos/Advertisement.dto';

@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) { }

  @Get('active')
  async findActive(): Promise<AdvertisementDto | null> {
    return this.advertisementService.findActive();
  }
}
