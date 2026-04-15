import { Module } from '@nestjs/common';
import { ProxyService } from '../service/proxy.service';
import { BoProxyService } from '../service/bo-proxy.service';
import { ProductProxyController } from '../endpoint/proxy.controller';
import { TextePromotionnelProxyController } from 'src/endpoint/TextePromotionnelProxy.controller';
import { UserProxyController } from 'src/endpoint/UserProxy.controller';
import { BoHealthProxyController } from 'src/endpoint/BoHealthProxy.controller';
import { CategoriesProxyController } from 'src/endpoint/CategoriesProxy.controller';
import { CategoriesPublicProxyController } from 'src/endpoint/CategoriesPublicProxy.controller';
import { CarouselProxyController } from 'src/endpoint/CarouselProxy.controller';
import { FaqProxyController } from 'src/endpoint/FaqProxy.controller';
import { ServicesProxyController } from 'src/endpoint/ServicesProxy.controller';
import { OrdersProxyController } from 'src/endpoint/OrdersProxy.controller';
import { StatsProxyController } from 'src/endpoint/StatsProxy.controller';
import { UploadController } from 'src/endpoint/upload.controller';

@Module({
  controllers: [
    ProductProxyController,
    TextePromotionnelProxyController,
    UserProxyController,
    BoHealthProxyController,
    CategoriesProxyController,
    CategoriesPublicProxyController,
    CarouselProxyController,
    FaqProxyController,
    ServicesProxyController,
    OrdersProxyController,
    StatsProxyController,
    UploadController,
  ],
  providers: [ProxyService, BoProxyService],
  exports: [ProxyService, BoProxyService],
})
export class ProxyModule {}
