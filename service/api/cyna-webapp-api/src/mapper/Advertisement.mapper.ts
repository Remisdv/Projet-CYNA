import { Injectable } from '@nestjs/common';
import { TextePromotionnel } from '../database/entity/Advertisement/Advertisement.entity';
import { AdvertisementDto } from '../dto/Advertisement/Advertisement.dto';

@Injectable()
export class AdvertisementMapper {
    toDto(entity: TextePromotionnel): AdvertisementDto {
        return {
            id: entity.id,
            textFr: entity.textFr,
            textEn: entity.textEn,
            isActive: entity.isActive,
        };
    }
}
