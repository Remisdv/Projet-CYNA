import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FaqService } from '../../service/Faq/Faq.service';
import { FaqDto, CreateUpdateFaqDto, ReorderFaqDto } from '../../service/dtos/Faq/Faq.dto';

@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get('tree')
  async findTree(@Query('lang') lang?: string): Promise<FaqDto[]> {
    return this.faqService.findTree(lang);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FaqDto> {
    return this.faqService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateUpdateFaqDto): Promise<FaqDto> {
    return this.faqService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateUpdateFaqDto): Promise<FaqDto> {
    return this.faqService.update(id, dto);
  }

  @Put(':id/reorder')
  async reorder(@Param('id') id: string, @Body() dto: ReorderFaqDto): Promise<FaqDto> {
    return this.faqService.reorder(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.faqService.delete(id);
  }
}
