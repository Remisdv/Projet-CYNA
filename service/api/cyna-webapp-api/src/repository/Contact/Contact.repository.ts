import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../../database/entity/Contact/ContactMessage.entity';

@Injectable()
export class ContactRepository {
    constructor(
        @InjectRepository(ContactMessage)
        private readonly repo: Repository<ContactMessage>,
    ) { }

    create(data: Partial<ContactMessage>): ContactMessage {
        return this.repo.create(data);
    }

    save(entity: ContactMessage): Promise<ContactMessage> {
        return this.repo.save(entity);
    }
}
