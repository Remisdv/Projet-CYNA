import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entity/product';
import { CategoryEntity } from '../../database/entity/category/category.entity';
import { ProductService } from '../../service/product/product.service';
import { ProductController } from '../../endpoint/product/product.controller';
import { ElasticsearchClientModule } from '../elasticsearch/elasticsearch.module';
import { ProductSearchService } from '../../service/elasticsearch/product-search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, CategoryEntity]),
    ElasticsearchClientModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductSearchService],
  exports: [ProductService],
})
export class ProductModule {}
