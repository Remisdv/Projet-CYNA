import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextePromotionnelController } from '../endpoint/TextePromotionnel/TextePromotionnel.controller';
import { TextePromotionnelService } from '../service/TextePromotionnel/TextePromotionnel.service';
import { TextePromotionnelMapper } from '../service/TextePromotionnel/mappers/TextePromotionnel.mapper';
import { TextePromotionnel } from '../database/entity/TextePromotionnel/TextePromotionnel.entity';
import { TextePromotionnelRepository } from '../repository/TextePromotionnel/TextePromotionnel.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TextePromotionnel])],
  controllers: [TextePromotionnelController],
  providers: [TextePromotionnelService, TextePromotionnelMapper, TextePromotionnelRepository],
})
export class TextePromotionnelModule { }
