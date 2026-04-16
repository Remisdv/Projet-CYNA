import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebappUser } from '../database/entity/WebappUser/WebappUser.entity';
import { AdminUsersController } from '../endpoint/AdminUsers/AdminUsers.controller';
import { AdminUsersService } from '../service/AdminUsers/AdminUsers.service';

@Module({
    imports: [TypeOrmModule.forFeature([WebappUser])],
    controllers: [AdminUsersController],
    providers: [AdminUsersService],
})
export class AdminUsersModule { }
