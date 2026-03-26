import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoryService } from '../../service/Category/Category.service';
import { CategoryDto, CreateUpdateCategoryDto } from '../../service/dtos/Category/Category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<CategoryDto[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoryService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateUpdateCategoryDto): Promise<CategoryDto> {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateUpdateCategoryDto): Promise<CategoryDto> {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(id);
  }
}
