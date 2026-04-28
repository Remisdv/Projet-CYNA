import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../endpoint/User/User.controller';
import { UserService } from '../service/User/User.service';
import { UserMapper } from '../service/User/mappers/User.mapper';
import { User } from '../database/entity/User/User.entity';
import { UserRepository } from '../repository/User/User.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserMapper, UserRepository],
  exports: [UserRepository],
})
export class UserModule { }
