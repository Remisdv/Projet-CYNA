import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TextePromotionnelService } from '../../service/TextePromotionnel/TextePromotionnel.service';
import { TextePromotionnel } from '../../database/entity/TextePromotionnel/TextePromotionnel.entity';

@Controller('promotionnel')
export class TextePromotionnelController {
  constructor(private readonly service: TextePromotionnelService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Get('active')
  getActive() {
    return this.service.findActive();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<TextePromotionnel>) {
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<TextePromotionnel>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}