import { Module } from '@nestjs/common';
import { ProxyService } from '../service/proxy.service';
import { ProductProxyController } from '../endpoint/proxy.controller';

@Module({
  controllers: [ProductProxyController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
