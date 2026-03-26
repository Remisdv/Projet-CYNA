import { Controller, Get, Post, Body, Put, Patch, Param, Delete } from '@nestjs/common';
import { TextePromotionnelService } from '../../service/TextePromotionnel/TextePromotionnel.service';
import { CreateUpdateTextePromotionnelDto, TextePromotionnelDto } from '../../service/dtos/TextPromotionnel/TextePromotionnel.dto';

@Controller('advertisements')
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

  @Patch(':id/activate')
  activate(@Param('id') id: string): Promise<TextePromotionnelDto> {
    return this.service.activate(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}