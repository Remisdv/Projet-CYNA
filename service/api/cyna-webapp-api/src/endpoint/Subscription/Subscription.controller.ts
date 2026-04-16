import { Controller, Get, Param, Headers } from '@nestjs/common';
import { SubscriptionService } from '../../service/Subscription/Subscription.service';
import { SubscriptionResponseDto } from '../../dto/Subscription/Subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Get()
  async findAll(@Headers('x-user-id') userId: string): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findOne(id, userId);
  }
}
