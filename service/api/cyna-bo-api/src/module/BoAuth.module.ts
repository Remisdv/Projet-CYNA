import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BoAuthService } from '../service/auth/bo-auth.service';
import { BoAuthController } from '../endpoint/auth/bo-auth.controller';
import { BoEmailService } from '../service/email/BoEmail.service';
import { UserModule } from './User.module';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-me',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [BoAuthController],
  providers: [BoAuthService, BoEmailService],
  exports: [BoAuthService, JwtModule],
})
export class BoAuthModule { }
