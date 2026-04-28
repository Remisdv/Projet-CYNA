import { Injectable } from '@nestjs/common';
import { WebappUserRepository } from '../../repository/WebappUser/WebappUser.repository';

@Injectable()
export class AdminUsersService {
    constructor(
        private readonly userRepository: WebappUserRepository,
    ) { }

    async findAll(page: number, limit: number, sort?: string) {
        const [items, total] = await this.userRepository.findAdminPaginated(page, limit, sort);
        return { items, total, page, limit };
    }
}
