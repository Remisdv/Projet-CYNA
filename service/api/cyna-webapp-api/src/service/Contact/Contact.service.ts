import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../../database/entity/Contact/ContactMessage.entity';
import { EmailService } from '../Email/Email.service';
import { CreateContactDto } from '../dtos/Contact/Contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly repo: Repository<ContactMessage>,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateContactDto, userId?: string): Promise<{ message: string }> {
    const contact = this.repo.create({
      ...dto,
      userId: userId || null,
    });
    await this.repo.save(contact);

    const contactDest = process.env.EMAIL_CONTACT_DEST || 'contact@cyna.com';

    // Send notification to the team
    await this.emailService.sendContactNotification(contactDest, dto);

    // Send confirmation to the user
    await this.emailService.sendContactConfirmation(dto.email, dto.name);

    return { message: 'Message envoyé avec succès' };
  }
}
