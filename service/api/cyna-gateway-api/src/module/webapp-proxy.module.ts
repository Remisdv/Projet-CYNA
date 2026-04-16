import { Module } from '@nestjs/common';
import { WebappProxyService } from '../service/webapp-proxy.service';
import { WebappCarouselProxyController } from '../endpoint/WebappCarouselProxy.controller';
import { WebappAdvertisementsProxyController } from '../endpoint/WebappAdvertisementsProxy.controller';
import { WebappAccountProxyController } from '../endpoint/WebappAccountProxy.controller';
import { WebappOrdersProxyController } from '../endpoint/WebappOrdersProxy.controller';
import { WebappSubscriptionsProxyController } from '../endpoint/WebappSubscriptionsProxy.controller';
import { WebappContactProxyController } from '../endpoint/WebappContactProxy.controller';
import { WebappPaymentProxyController } from '../endpoint/WebappPaymentProxy.controller';
import { WebappCartProxyController } from '../endpoint/WebappCartProxy.controller';
import { NotificationsProxyController } from '../endpoint/NotificationsProxy.controller';

@Module({
  controllers: [
    WebappCarouselProxyController,
    WebappAdvertisementsProxyController,
    WebappAccountProxyController,
    WebappOrdersProxyController,
    WebappSubscriptionsProxyController,
    WebappContactProxyController,
    WebappPaymentProxyController,
    WebappCartProxyController,
    NotificationsProxyController,
  ],
  providers: [WebappProxyService],
  exports: [WebappProxyService],
})
export class WebappProxyModule { }
