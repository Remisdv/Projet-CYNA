import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './module/health.module';
import { EmailModule } from './module/Email.module';
import { StripeModule } from './module/Stripe.module';
import { CarouselModule } from './module/Carousel.module';
import { AdvertisementModule } from './module/Advertisement.module';
import { WebappAuthModule } from './module/WebappAuth.module';
import { AccountModule } from './module/Account.module';
import { PaymentModule } from './module/Payment.module';
import { OrderModule } from './module/Order.module';
import { SubscriptionModule } from './module/Subscription.module';
import { ContactModule } from './module/Contact.module';
import { CartModule } from './module/Cart.module';
import { NotificationsModule } from './module/Notifications.module';
import { AdminUsersModule } from './module/AdminUsers.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    EmailModule,
    StripeModule,
    HealthModule,
    CarouselModule,
    AdvertisementModule,
    WebappAuthModule,
    AccountModule,
    PaymentModule,
    OrderModule,
    SubscriptionModule,
    ContactModule,
    CartModule,
    NotificationsModule,
    AdminUsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
