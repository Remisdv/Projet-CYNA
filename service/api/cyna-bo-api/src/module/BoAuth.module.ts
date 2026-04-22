import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../database/entity/User/User.entity';
import { BoAuthService } from '../service/auth/bo-auth.service';
import { BoAuthController } from '../endpoint/auth/bo-auth.controller';
import { BoEmailService } from '../service/email/BoEmail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
