import { Module } from '@nestjs/common';
import { ProxyService } from '../service/proxy.service';
import { BoProxyService } from '../service/bo-proxy.service';
import { ProductProxyController } from '../endpoint/proxy.controller';
import { TextePromotionnelProxyController } from 'src/endpoint/TextePromotionnelProxy.controller';
import { UserProxyController } from 'src/endpoint/UserProxy.controller';
import { BoHealthProxyController } from 'src/endpoint/BoHealthProxy.controller';

@Module({
  controllers: [
    ProductProxyController,
    TextePromotionnelProxyController,
    UserProxyController,
    BoHealthProxyController,
  ],
  providers: [ProxyService, BoProxyService],
  exports: [ProxyService, BoProxyService],
})
export class ProxyModule {}
