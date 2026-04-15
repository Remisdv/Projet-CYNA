import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebappUser } from '../database/entity/WebappUser/WebappUser.entity';
import { AccountController } from '../endpoint/Account/Account.controller';
import { AccountService } from '../service/Account/Account.service';
import { AccountMapper } from '../service/mappers/Account.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([WebappUser])],
  controllers: [AccountController],
  providers: [AccountService, AccountMapper],
})
export class AccountModule {}
