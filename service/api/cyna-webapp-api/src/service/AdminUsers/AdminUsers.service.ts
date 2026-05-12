import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { WebappUserStatus } from '../../database/entity/WebappUser/WebappUser.entity';
import { WebappUserAdminRepository } from '../../repository/WebappUser/WebappUserAdmin.repository';
import { AdminUserMapper } from './mappers/AdminUser.mapper';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  AdminUserDto,
  AdminUserListDto,
} from './dtos/AdminUser.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly repository: WebappUserAdminRepository,
    private readonly mapper: AdminUserMapper,
  ) {}

  async findAll(
    page: number,
    limit: number,
    filters: {
      status?: WebappUserStatus;
      search?: string;
      dateDebut?: Date;
      dateFin?: Date;
      sort?: string;
    } = {},
  ): Promise<AdminUserListDto> {
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number(limit) > 0 ? Number(limit) : 25;

    const { items, total } = await this.repository.findFiltered(
      pageNum,
      limitNum,
      filters,
    );
    return {
      items: this.mapper.toDtoArray(items),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string): Promise<AdminUserDto> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException(`Client ${id} introuvable`);
    return this.mapper.toDto(entity);
  }

  async create(data: AdminCreateUserDto): Promise<AdminUserDto & { tempPassword: string }> {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException(`Un client avec l'email ${data.email} existe déjà`);
    }
    const tempPassword = this.generateTemporaryPassword();
    const entity = this.repository.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      status: data.status ?? WebappUserStatus.ACTIVE,
      passwordHash: this.hashPassword(tempPassword),
    });
    const saved = await this.repository.save(entity);
    return { ...this.mapper.toDto(saved), tempPassword };
  }

  async update(id: string, data: AdminUpdateUserDto): Promise<AdminUserDto> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException(`Client ${id} introuvable`);

    if (data.email && data.email !== entity.email) {
      const dup = await this.repository.findByEmail(data.email);
      if (dup) throw new BadRequestException(`Email ${data.email} déjà utilisé`);
    }
    const merged = this.repository.merge(entity, data as any);
    const saved = await this.repository.save(merged);
    return this.mapper.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const affected = await this.repository.deleteById(id);
    if (affected === 0) throw new NotFoundException(`Client ${id} introuvable`);
  }

  async resetPassword(id: string): Promise<{ tempPassword: string }> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException(`Client ${id} introuvable`);
    const tempPassword = this.generateTemporaryPassword();
    entity.passwordHash = this.hashPassword(tempPassword);
    await this.repository.save(entity);
    return { tempPassword };
  }

  private generateTemporaryPassword(): string {
    return crypto.randomBytes(12).toString('base64').slice(0, 16);
  }

  private hashPassword(password: string): string {
    // Aligné avec WebappAuth.service / Account.service / users.seed (sha256).
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
