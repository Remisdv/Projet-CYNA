import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserStatus } from '../../database/entity/User/User.entity';
import { UserRepository } from '../../repository/User/User.repository';
import { UserMapper } from './mappers/User.mapper';
import { UserDto, CreateUserDto, UpdateUserDto, UserListDto } from './dtos/User.dto';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mapper: UserMapper,
  ) { }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      role?: string;
      status?: UserStatus;
      dateDebut?: Date;
      dateFin?: Date;
      sort?: string;
    } = {},
  ): Promise<UserListDto> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const { items, total } = await this.userRepository.findFiltered(pageNum, limitNum, filters);

    return {
      items: this.mapper.toDtoArray(items),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`Utilisateur avec l'id ${id} introuvable`);
    return this.mapper.toDto(user);
  }

  async create(data: CreateUserDto): Promise<UserDto & { tempPassword: string }> {
    // Vérifier que l'email n'existe pas déjà
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new BadRequestException(`Un utilisateur avec l'email ${data.email} existe déjà`);

    const entity = this.mapper.toEntity(data);
    // Générer un mot de passe temporaire
    const tempPassword = this.generateTemporaryPassword();
    entity.passwordHash = this.hashPassword(tempPassword);

    const newUser = this.userRepository.create(entity);
    const saved = await this.userRepository.save(newUser);

    // TODO: Envoyer un email avec le mot de passe temporaire
    // await this.emailService.sendWelcomeEmail(saved.email, tempPassword);

    return { ...this.mapper.toDto(saved), tempPassword };
  }

  async update(id: string, data: UpdateUserDto): Promise<UserDto> {
    const entity = await this.userRepository.findById(id);
    if (!entity) throw new NotFoundException(`Utilisateur avec l'id ${id} introuvable`);

    // Vérifier l'unicité de l'email si modifié
    if (data.email && data.email !== entity.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) throw new BadRequestException(`Un utilisateur avec l'email ${data.email} existe déjà`);
    }

    const mappedData = this.mapper.toUpdateEntity(data);
    const updated = this.userRepository.merge(entity, mappedData);
    const saved = await this.userRepository.save(updated);
    return this.mapper.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const affected = await this.userRepository.deleteById(id);
    if (affected === 0) throw new NotFoundException(`Impossible de supprimer l'id ${id}`);
  }

  async resetPassword(id: string): Promise<{ tempPassword: string }> {
    const entity = await this.userRepository.findById(id);
    if (!entity) throw new NotFoundException(`Utilisateur avec l'id ${id} introuvable`);

    const tempPassword = this.generateTemporaryPassword();
    entity.passwordHash = this.hashPassword(tempPassword);
    await this.userRepository.save(entity);

    // TODO: Envoyer un email avec le lien de réinitialisation
    // await this.emailService.sendPasswordResetEmail(entity.email);

    return { tempPassword };
  }

  private generateTemporaryPassword(): string {
    return crypto.randomBytes(12).toString('base64').slice(0, 16);
  }

  private hashPassword(password: string): string {
    // Aligné avec bo-auth.service (sha256).
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
