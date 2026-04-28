import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../../repository/Subscription/Subscription.repository';
import { SubscriptionMapper } from './mappers/Subscription.mapper';
import { SubscriptionResponseDto } from './dtos/Subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly mapper: SubscriptionMapper,
  ) { }

  async findAllByUser(userId: string): Promise<SubscriptionResponseDto[]> {
    const entities = await this.subscriptionRepository.findAllByUser(userId);
    return this.mapper.toDtoArray(entities);
  }

  async findOne(id: string, userId: string): Promise<SubscriptionResponseDto> {
    const entity = await this.subscriptionRepository.findByIdAndUser(id, userId);
    if (!entity) return null;
    return this.mapper.toDto(entity);
  }
}
