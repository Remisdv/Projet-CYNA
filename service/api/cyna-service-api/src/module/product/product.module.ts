import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entity/product';
import { ProductService } from '../../service/product/product.service';
import { ProductController } from '../../endpoint/product/product.controller';
import { ElasticsearchClientModule } from '../elasticsearch/elasticsearch.module';
import { ProductSearchService } from '../../service/elasticsearch/product-search.service';
import { ProductRepository } from '../../repository/product/product.repository';
import { ProductMapper } from '../../service/product/mappers/product.mapper';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    ElasticsearchClientModule,
    CategoryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductSearchService, ProductRepository, ProductMapper],
  exports: [ProductService, ProductRepository],
})
export class ProductModule { }
