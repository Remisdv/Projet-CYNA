import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { WebappUserStatus } from '../../database/entity/WebappUser/WebappUser.entity';
import { AdminUsersService } from '../../service/AdminUsers/AdminUsers.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  AdminUserDto,
  AdminUserListDto,
} from '../../service/AdminUsers/dtos/AdminUser.dto';

/**
 * Admin endpoints for managing webapp customers.
 *
 * NOTE: These routes are NOT protected at the webapp-api level. They are
 * intended to be exposed only through cyna-gateway-api which enforces the
 * `@Roles('admin')` guard before proxying to this service. The gateway is the
 * only public ingress; webapp-api should run on a private network.
 */
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
    @Query('status') status?: WebappUserStatus,
    @Query('search') search?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('sort') sort?: string,
  ): Promise<AdminUserListDto> {
    return this.service.findAll(page, limit, {
      status,
      search,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      sort,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdminUserDto> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: AdminCreateUserDto) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: AdminUpdateUserDto): Promise<AdminUserDto> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string): Promise<{ tempPassword: string }> {
    return this.service.resetPassword(id);
  }
}
