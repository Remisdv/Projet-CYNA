import { Controller, Get, Query } from '@nestjs/common';
import { AdvertisementService } from '../../service/Advertisement/Advertisement.service';
import { AdvertisementDto } from '../../service/Advertisement/dtos/Advertisement.dto';

@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) { }

  /**
   * GET /advertisements?isActive=true
   * Lists advertisements; when ?isActive=true returns only the active one (wrapped in array).
   */
  @Get()
  async findAll(@Query('isActive') isActive?: string): Promise<AdvertisementDto[]> {
    if (isActive === 'true') {
      const active = await this.advertisementService.findActive();
      return active ? [active] : [];
    }
    return this.advertisementService.findAll();
  }
}
