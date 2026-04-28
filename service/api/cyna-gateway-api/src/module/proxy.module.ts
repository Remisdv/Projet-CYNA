import { Module } from '@nestjs/common';
import { ProxyService } from '../service/proxy.service';
import { BoProxyService } from '../service/bo-proxy.service';
import { ProductProxyController } from '../endpoint/proxy.controller';
import { TextePromotionnelProxyController } from 'src/endpoint/TextePromotionnelProxy.controller';
import { UserProxyController } from 'src/endpoint/UserProxy.controller';
import { BoHealthProxyController } from 'src/endpoint/BoHealthProxy.controller';
import { CategoriesProxyController } from 'src/endpoint/CategoriesProxy.controller';
import { CategoriesPublicProxyController } from 'src/endpoint/CategoriesPublicProxy.controller';
import { ServicesProxyController } from 'src/endpoint/ServicesProxy.controller';
import { OrdersProxyController } from 'src/endpoint/OrdersProxy.controller';
import { StatsProxyController } from 'src/endpoint/StatsProxy.controller';
import { TrackingProxyController } from 'src/endpoint/TrackingProxy.controller';
import { UploadController } from 'src/endpoint/upload.controller';

@Module({
  controllers: [
    ProductProxyController,
    TextePromotionnelProxyController,
    UserProxyController,
    BoHealthProxyController,
    CategoriesProxyController,
    CategoriesPublicProxyController,
    ServicesProxyController,
    OrdersProxyController,
    StatsProxyController,
    TrackingProxyController,
    UploadController,
  ],
  providers: [ProxyService, BoProxyService],
  exports: [ProxyService, BoProxyService],
})
export class ProxyModule { }
