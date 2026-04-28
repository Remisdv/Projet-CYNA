import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebappUser } from '../../database/entity/WebappUser/WebappUser.entity';

@Injectable()
export class WebappUserRepository {
    constructor(
        @InjectRepository(WebappUser)
        private readonly repo: Repository<WebappUser>,
    ) { }

    findById(id: string): Promise<WebappUser | null> {
        return this.repo.findOneBy({ id });
    }

    findByEmail(email: string): Promise<WebappUser | null> {
        return this.repo.findOneBy({ email });
    }

    create(data: Partial<WebappUser>): WebappUser {
        return this.repo.create(data);
    }

    save(entity: WebappUser): Promise<WebappUser> {
        return this.repo.save(entity);
    }
}
