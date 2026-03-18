import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from '../../service/User/User.service';
import { CreateUserDto, UpdateUserDto, UserDto, UserListDto } from '../../service/dtos/User/User.dto';
import { UserStatus } from '../../database/entity/User/User.entity';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: string,
    @Query('status') status?: UserStatus,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('sort') sort?: string,
  ): Promise<UserListDto> {
    const filters = {
      role,
      status,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      sort,
    };
    return this.service.findAll(page, limit, filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: CreateUserDto): Promise<UserDto> {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto): Promise<UserDto> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id', ParseIntPipe) id: number): Promise<{ tempPassword: string }> {
    return this.service.resetPassword(id);
  }
}
