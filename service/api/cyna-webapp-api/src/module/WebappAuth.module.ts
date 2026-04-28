import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PasswordResetToken } from '../database/entity/WebappUser/PasswordResetToken.entity';
import { WebappAuthController } from '../endpoint/Auth/WebappAuth.controller';
import { WebappAuthService } from '../service/Auth/WebappAuth.service';
import { PasswordResetTokenRepository } from '../repository/PasswordResetToken/PasswordResetToken.repository';
import { AccountModule } from './Account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetToken]),
    AccountModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-me',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [WebappAuthController],
  providers: [WebappAuthService, PasswordResetTokenRepository],
  exports: [WebappAuthService, JwtModule],
})
export class WebappAuthModule { }
