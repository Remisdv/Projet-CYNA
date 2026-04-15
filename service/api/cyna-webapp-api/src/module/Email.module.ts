import { Module, Global } from '@nestjs/common';
import { EmailService } from '../service/Email/Email.service';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
