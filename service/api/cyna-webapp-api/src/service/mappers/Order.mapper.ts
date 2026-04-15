import { Injectable } from '@nestjs/common';
import { CustomerOrder } from '../../database/entity/Order/CustomerOrder.entity';
import { OrderResponseDto } from '../dtos/Order/Order.dto';

@Injectable()
export class OrderMapper {
  toDto(entity: CustomerOrder): OrderResponseDto {
    return {
      id: entity.id,
      ref: entity.ref,
      items: entity.items,
      amount: Number(entity.amount),
      status: entity.status,
      paymentStatus: entity.paymentStatus,
      billingAddress: entity.billingAddress,
      shippingAddress: entity.shippingAddress || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toDtoArray(entities: CustomerOrder[]): OrderResponseDto[] {
    return entities.map((e) => this.toDto(e));
  }
}
