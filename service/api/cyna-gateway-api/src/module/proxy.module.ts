import { Module } from '@nestjs/common';
import { ProxyService } from '../service/proxy.service';
import { BoProxyService } from '../service/bo-proxy.service';
import { ProductProxyController } from '../endpoint/proxy.controller';
import { TextePromotionnelProxyController } from 'src/endpoint/TextePromotionnelProxy.controller';
import { UserProxyController } from 'src/endpoint/UserProxy.controller';
import { BoHealthProxyController } from 'src/endpoint/BoHealthProxy.controller';
import { CategoriesProxyController } from 'src/endpoint/CategoriesProxy.controller';
import { CarouselProxyController } from 'src/endpoint/CarouselProxy.controller';
import { FaqProxyController } from 'src/endpoint/FaqProxy.controller';

@Module({
  controllers: [
    ProductProxyController,
    TextePromotionnelProxyController,
    UserProxyController,
    BoHealthProxyController,
    CategoriesProxyController,
    CarouselProxyController,
    FaqProxyController,
  ],
  providers: [ProxyService, BoProxyService],
  exports: [ProxyService, BoProxyService],
})
export class ProxyModule {}
