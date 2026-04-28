import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebappSubscription } from '../database/entity/Subscription/WebappSubscription.entity';
import { SubscriptionController } from '../endpoint/Subscription/Subscription.controller';
import { SubscriptionService } from '../service/Subscription/Subscription.service';
import { SubscriptionMapper } from '../service/Subscription/mappers/Subscription.mapper';
import { SubscriptionRepository } from '../repository/Subscription/Subscription.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WebappSubscription])],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionMapper, SubscriptionRepository],
  exports: [SubscriptionRepository],
})
export class SubscriptionModule { }
