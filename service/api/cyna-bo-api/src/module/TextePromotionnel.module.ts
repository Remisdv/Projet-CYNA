import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextePromotionnelController } from '../endpoint/TextePromotionnel/TextePromotionnel.controller';
import { TextePromotionnelService } from '../service/TextePromotionnel/TextePromotionnel.service';
import { TextePromotionnelMapper } from '../service/mappers/TextePromotionnel.mapper';
import { TextePromotionnel } from '../database/entity/TextePromotionnel/TextePromotionnel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TextePromotionnel])],
  controllers: [TextePromotionnelController],
  providers: [TextePromotionnelService, TextePromotionnelMapper],
})
export class TextePromotionnelModule {}
