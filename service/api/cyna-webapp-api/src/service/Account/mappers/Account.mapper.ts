import { Injectable } from '@nestjs/common';
import { WebappUser } from '../../../database/entity/WebappUser/WebappUser.entity';
import { ProfileResponseDto } from '../dtos/Account.dto';

@Injectable()
export class AccountMapper {
    toProfile(entity: WebappUser): ProfileResponseDto {
        return {
            id: entity.id,
            email: entity.email,
            firstName: entity.firstName,
            lastName: entity.lastName,
            phone: entity.phone || null,
            billingAddress: entity.billingAddress || null,
            shippingAddress: entity.shippingAddress || null,
            createdAt: entity.createdAt,
            twoFactorEnabled: entity.twoFactorEnabled ?? false,
            totpEnabled: entity.totpEnabled ?? false,
        };
    }
}
