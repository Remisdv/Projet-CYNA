import { Controller, Get, Query } from '@nestjs/common';
import { AdminUsersService } from '../../service/AdminUsers/AdminUsers.service';

@Controller('admin/users')
export class AdminUsersController {
    constructor(private readonly adminUsersService: AdminUsersService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('sort') sort?: string,
    ) {
        const p = Math.max(1, parseInt(page ?? '1', 10) || 1);
        const l = Math.min(100, Math.max(1, parseInt(limit ?? '10', 10) || 10));

        return this.adminUsersService.findAll(p, l, sort);
    }
}
