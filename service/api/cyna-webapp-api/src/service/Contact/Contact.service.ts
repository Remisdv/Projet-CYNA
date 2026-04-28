import { Injectable } from '@nestjs/common';
import { ContactRepository } from '../../repository/Contact/Contact.repository';
import { EmailService } from '../Email/Email.service';
import { CreateContactDto } from './dtos/Contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly emailService: EmailService,
  ) { }

  async create(dto: CreateContactDto, userId?: string): Promise<{ message: string }> {
    const contact = this.contactRepository.create({
      ...dto,
      userId: userId || null,
    });
    await this.contactRepository.save(contact);

    const contactDest = process.env.EMAIL_CONTACT_DEST || 'contact@cyna.com';

    // Send notification to the team
    await this.emailService.sendContactNotification(contactDest, dto);

    // Send confirmation to the user
    await this.emailService.sendContactConfirmation(dto.email, dto.name);

    return { message: 'Message envoyé avec succès' };
  }
}
