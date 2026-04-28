import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../database/entity/category/category.entity';
import { CategoryService } from '../../service/category/category.service';
import { CategoryController } from '../../endpoint/category/category.controller';
import { CategoryRepository } from '../../repository/category/category.repository';
import { CategoryMapper } from '../../service/category/mappers/category.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, CategoryMapper],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule { }
