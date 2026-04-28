import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebappUser } from '../database/entity/WebappUser/WebappUser.entity';
import { TwoFactorController } from '../endpoint/TwoFactor/TwoFactor.controller';
import { TwoFactorService } from '../service/TwoFactor/TwoFactor.service';
import { WebappUserRepository } from '../repository/WebappUser/WebappUser.repository';
import { EmailModule } from './Email.module';

@Module({
  imports: [TypeOrmModule.forFeature([WebappUser]), EmailModule],
  controllers: [TwoFactorController],
  providers: [TwoFactorService, WebappUserRepository],
})
export class TwoFactorModule { }
