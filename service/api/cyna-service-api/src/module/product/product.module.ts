import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entity/product';
import { CategoryEntity } from '../../database/entity/category/category.entity';
import { ProductService } from '../../service/product/product.service';
import { ProductController } from '../../endpoint/product/product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
