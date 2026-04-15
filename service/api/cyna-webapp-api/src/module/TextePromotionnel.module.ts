import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextePromotionnel } from '../database/entity/TextePromotionnel/TextePromotionnel.entity';
import { TextePromotionnelController } from '../endpoint/TextePromotionnel/TextePromotionnel.controller';
import { TextePromotionnelService } from '../service/TextePromotionnel/TextePromotionnel.service';

@Module({
  imports: [TypeOrmModule.forFeature([TextePromotionnel])],
  controllers: [TextePromotionnelController],
  providers: [TextePromotionnelService],
})
export class TextePromotionnelModule {}
