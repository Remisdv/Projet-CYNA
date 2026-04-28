import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PasswordResetToken } from '../../database/entity/WebappUser/PasswordResetToken.entity';

@Injectable()
export class PasswordResetTokenRepository {
    constructor(
        @InjectRepository(PasswordResetToken)
        private readonly repo: Repository<PasswordResetToken>,
    ) { }

    create(data: Partial<PasswordResetToken>): PasswordResetToken {
        return this.repo.create(data);
    }

    save(entity: PasswordResetToken): Promise<PasswordResetToken> {
        return this.repo.save(entity);
    }

    findActiveByToken(token: string): Promise<PasswordResetToken | null> {
        return this.repo.findOneBy({ token, usedAt: IsNull() });
    }
}
