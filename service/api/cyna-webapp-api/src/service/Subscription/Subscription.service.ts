import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebappSubscription } from '../../database/entity/Subscription/WebappSubscription.entity';
import { SubscriptionMapper } from '../mappers/Subscription.mapper';
import { SubscriptionResponseDto } from '../dtos/Subscription/Subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(WebappSubscription)
    private readonly repo: Repository<WebappSubscription>,
    private readonly mapper: SubscriptionMapper,
  ) {}

  async findAllByUser(userId: string): Promise<SubscriptionResponseDto[]> {
    const entities = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return this.mapper.toDtoArray(entities);
  }

  async findOne(id: string, userId: string): Promise<SubscriptionResponseDto> {
    const entity = await this.repo.findOneBy({ id, userId });
    if (!entity) return null;
    return this.mapper.toDto(entity);
  }
}
