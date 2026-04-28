import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../database/entity/Category/Category.entity';
import { CategoryController } from '../endpoint/Category/Category.controller';
import { CategoryService } from '../service/Category/Category.service';
import { CategoryMapper } from '../service/Category/mappers/Category.mapper';
import { CategoryRepository } from '../repository/Category/Category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryMapper, CategoryRepository],
})
export class CategoryModule { }
