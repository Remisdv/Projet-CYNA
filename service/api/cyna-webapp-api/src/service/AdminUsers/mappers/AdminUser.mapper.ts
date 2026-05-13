import { Injectable } from '@nestjs/common';
import { WebappUser } from '../../../database/entity/WebappUser/WebappUser.entity';
import { AdminUserDto } from '../dtos/AdminUser.dto';

@Injectable()
export class AdminUserMapper {
  toDto(entity: WebappUser): AdminUserDto {
    return {
      id: entity.id,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      phone: entity.phone ?? null,
      status: entity.status,
      twoFactorEnabled: entity.twoFactorEnabled,
      totpEnabled: entity.totpEnabled,
      stripeCustomerId: entity.stripeCustomerId ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toDtoArray(entities: WebappUser[]): AdminUserDto[] {
    return entities.map((e) => this.toDto(e));
  }
}
