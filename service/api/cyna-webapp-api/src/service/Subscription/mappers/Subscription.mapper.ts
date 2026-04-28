import { Injectable } from '@nestjs/common';
import { WebappSubscription } from '../../../database/entity/Subscription/WebappSubscription.entity';
import { SubscriptionResponseDto } from '../dtos/Subscription.dto';

@Injectable()
export class SubscriptionMapper {
    toDto(entity: WebappSubscription): SubscriptionResponseDto {
        return {
            id: entity.id,
            productId: entity.productId,
            productName: entity.productName,
            planType: entity.planType,
            status: entity.status,
            price: Number(entity.price),
            startDate: entity.startDate,
            renewalDate: entity.renewalDate,
            createdAt: entity.createdAt,
        };
    }

    toDtoArray(entities: WebappSubscription[]): SubscriptionResponseDto[] {
        return entities.map((e) => this.toDto(e));
    }
}
