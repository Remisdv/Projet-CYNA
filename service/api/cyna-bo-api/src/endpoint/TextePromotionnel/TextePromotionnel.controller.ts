import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TextePromotionnelService } from '../../service/TextePromotionnel/TextePromotionnel.service';
import { CreateUpdateTextePromotionnelDto, TextePromotionnelDto } from '../../service/dtos/TextPromotionnel/TextePromotionnel.dto';

@Controller('promotionnel')
export class TextePromotionnelController {
  constructor(private readonly service: TextePromotionnelService) {}

  @Get()
  getAll(): Promise<TextePromotionnelDto[]> {
    return this.service.findAll();
  }

  @Get('active')
  getActive(): Promise<TextePromotionnelDto> {
    return this.service.findActive();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<TextePromotionnelDto> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: CreateUpdateTextePromotionnelDto): Promise<TextePromotionnelDto> {
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: CreateUpdateTextePromotionnelDto): Promise<TextePromotionnelDto> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}