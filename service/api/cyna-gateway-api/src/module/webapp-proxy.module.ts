import { Module } from '@nestjs/common';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { ProxyService } from '../service/proxy.service';
import { WebappAdvertisementsProxyController } from '../endpoint/WebappAdvertisementsProxy.controller';
import { WebappAccountProxyController } from '../endpoint/WebappAccountProxy.controller';
import { WebappTwoFactorProxyController } from '../endpoint/WebappTwoFactorProxy.controller';
import { WebappOrdersProxyController } from '../endpoint/WebappOrdersProxy.controller';
import { WebappSubscriptionsProxyController } from '../endpoint/WebappSubscriptionsProxy.controller';
import { WebappContactProxyController } from '../endpoint/WebappContactProxy.controller';
import { WebappPaymentProxyController } from '../endpoint/WebappPaymentProxy.controller';
import { WebappCartProxyController } from '../endpoint/WebappCartProxy.controller';
import { CustomersProxyController } from '../endpoint/CustomersProxy.controller';

@Module({
  controllers: [
    WebappAdvertisementsProxyController,
    WebappAccountProxyController,
    WebappTwoFactorProxyController,
    WebappOrdersProxyController,
    WebappSubscriptionsProxyController,
    WebappContactProxyController,
    WebappPaymentProxyController,
    WebappCartProxyController,
    CustomersProxyController,
  ],
  providers: [WebappProxyService, ProxyService],
  exports: [WebappProxyService],
})
export class WebappProxyModule { }
