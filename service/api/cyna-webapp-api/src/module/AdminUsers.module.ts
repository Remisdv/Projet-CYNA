import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebappUser } from '../database/entity/WebappUser/WebappUser.entity';
import { AdminUsersController } from '../endpoint/AdminUsers/AdminUsers.controller';
import { AdminUsersService } from '../service/AdminUsers/AdminUsers.service';
import { AdminUserMapper } from '../service/AdminUsers/mappers/AdminUser.mapper';
import { WebappUserAdminRepository } from '../repository/WebappUser/WebappUserAdmin.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WebappUser])],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUserMapper, WebappUserAdminRepository],
})
export class AdminUsersModule { }
