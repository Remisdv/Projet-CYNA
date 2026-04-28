import { Module } from '@nestjs/common';
import { AdminUsersController } from '../endpoint/AdminUsers/AdminUsers.controller';
import { AdminUsersService } from '../service/AdminUsers/AdminUsers.service';
import { AccountModule } from './Account.module';

@Module({
    imports: [AccountModule],
    controllers: [AdminUsersController],
    providers: [AdminUsersService],
})
export class AdminUsersModule { }
