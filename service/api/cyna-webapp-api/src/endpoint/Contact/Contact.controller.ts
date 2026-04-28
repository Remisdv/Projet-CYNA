import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ContactService } from '../../service/Contact/Contact.service';
import { CreateContactDto } from '../../service/Contact/dtos/Contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  async create(
    @Body() dto: CreateContactDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<{ message: string }> {
    return this.contactService.create(dto, userId || undefined);
  }
}
