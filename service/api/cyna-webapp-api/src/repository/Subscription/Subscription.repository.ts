import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebappSubscription } from '../../database/entity/Subscription/WebappSubscription.entity';

@Injectable()
export class SubscriptionRepository {
    constructor(
        @InjectRepository(WebappSubscription)
        private readonly repo: Repository<WebappSubscription>,
    ) { }

    findAllByUser(userId: string): Promise<WebappSubscription[]> {
        return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }

    findByIdAndUser(id: string, userId: string): Promise<WebappSubscription | null> {
        return this.repo.findOneBy({ id, userId });
    }

    findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<WebappSubscription | null> {
        return this.repo.findOneBy({ stripeSubscriptionId });
    }

    create(data: Partial<WebappSubscription>): WebappSubscription {
        return this.repo.create(data);
    }

    save(entity: WebappSubscription): Promise<WebappSubscription> {
        return this.repo.save(entity);
    }
}
