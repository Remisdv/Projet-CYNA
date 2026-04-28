import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query } from '@nestjs/common';
import { TextePromotionnelService } from '../../service/TextePromotionnel/TextePromotionnel.service';
import { CreateUpdateTextePromotionnelDto, PatchTextePromotionnelDto, TextePromotionnelDto } from '../../service/TextePromotionnel/dtos/TextePromotionnel.dto';

@Controller('advertisements')
export class TextePromotionnelController {
  constructor(private readonly service: TextePromotionnelService) { }

  @Get()
  getAll(@Query('isActive') isActive?: string): Promise<TextePromotionnelDto[]> {
    if (isActive === 'true') {
      return this.service.findAllActive();
    }
    return this.service.findAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<TextePromotionnelDto> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: CreateUpdateTextePromotionnelDto): Promise<TextePromotionnelDto> {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: CreateUpdateTextePromotionnelDto): Promise<TextePromotionnelDto> {
    return this.service.update(id, data);
  }

  @Patch(':id')
  patchUpdate(@Param('id') id: string, @Body() data: PatchTextePromotionnelDto): Promise<TextePromotionnelDto> {
    return this.service.patchUpdate(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}