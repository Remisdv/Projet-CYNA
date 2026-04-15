import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { WebappUser } from '../database/entity/WebappUser/WebappUser.entity';
import { PasswordResetToken } from '../database/entity/WebappUser/PasswordResetToken.entity';
import { WebappAuthController } from '../endpoint/Auth/WebappAuth.controller';
import { WebappAuthService } from '../service/Auth/WebappAuth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebappUser, PasswordResetToken]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-me',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [WebappAuthController],
  providers: [WebappAuthService],
  exports: [WebappAuthService, JwtModule],
})
export class WebappAuthModule {}
