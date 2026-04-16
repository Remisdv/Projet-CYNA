import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebappSubscription } from '../database/entity/Subscription/WebappSubscription.entity';
import { SubscriptionController } from '../endpoint/Subscription/Subscription.controller';
import { SubscriptionService } from '../service/Subscription/Subscription.service';
import { SubscriptionMapper } from '../mapper/Subscription.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([WebappSubscription])],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionMapper],
})
export class SubscriptionModule { }
