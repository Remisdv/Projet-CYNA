import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMessage } from '../database/entity/Contact/ContactMessage.entity';
import { ContactController } from '../endpoint/Contact/Contact.controller';
import { ContactService } from '../service/Contact/Contact.service';
import { ContactRepository } from '../repository/Contact/Contact.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage])],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
})
export class ContactModule { }
