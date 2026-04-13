import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from '../database/entity/Faq/Faq.entity';
import { FaqController } from '../endpoint/Faq/Faq.controller';
import { FaqService } from '../service/Faq/Faq.service';
import { FaqMapper } from '../service/mappers/Faq.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [FaqController],
  providers: [FaqService, FaqMapper],
})
export class FaqModule {}
