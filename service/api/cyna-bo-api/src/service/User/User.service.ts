import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserStatus } from '../../database/entity/User/User.entity';
import { UserMapper } from '../mappers/User.mapper';
import { UserDto, CreateUserDto, UpdateUserDto, UserListDto } from '../dtos/User/User.dto';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly mapper: UserMapper,
  ) {}

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
    const query = this.repo.createQueryBuilder('user');

    // Appliquer les filtres
    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }
    if (filters.status) {
      query.andWhere('user.status = :status', { status: filters.status });
    }
    if (filters.dateDebut) {
      query.andWhere('user.createdAt >= :dateDebut', { dateDebut: filters.dateDebut });
    }
    if (filters.dateFin) {
      query.andWhere('user.createdAt <= :dateFin', { dateFin: filters.dateFin });
    }

    // Appliquer le tri
    if (filters.sort) {
      const [field, direction] = filters.sort.split(':');
      query.orderBy(`user.${field}`, (direction?.toUpperCase() as 'ASC' | 'DESC') || 'ASC');
    } else {
      query.orderBy('user.createdAt', 'DESC');
    }

    // Appliquer la pagination
    query.skip((page - 1) * limit).take(limit);

    const [users, total] = await query.getManyAndCount();

    return {
      items: this.mapper.toDtoArray(users),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`Utilisateur avec l'id ${id} introuvable`);
    return this.mapper.toDto(user);
  }

  async create(data: CreateUserDto): Promise<UserDto> {
    // Vérifier que l'email n'existe pas déjà
    const existingUser = await this.repo.findOneBy({ email: data.email });
    if (existingUser) throw new BadRequestException(`Un utilisateur avec l'email ${data.email} existe déjà`);

    const entity = this.mapper.toEntity(data);
    // Générer un mot de passe temporaire
    const tempPassword = this.generateTemporaryPassword();
    entity.passwordHash = this.hashPassword(tempPassword);

    const newUser = this.repo.create(entity);
    const saved = await this.repo.save(newUser);

    // TODO: Envoyer un email avec le mot de passe temporaire
    // await this.emailService.sendWelcomeEmail(saved.email, tempPassword);

    return this.mapper.toDto(saved);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserDto> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Utilisateur avec l'id ${id} introuvable`);

    // Vérifier l'unicité de l'email si modifié
    if (data.email && data.email !== entity.email) {
      const existingUser = await this.repo.findOneBy({ email: data.email });
      if (existingUser) throw new BadRequestException(`Un utilisateur avec l'email ${data.email} existe déjà`);
    }

    const mappedData = this.mapper.toUpdateEntity(data);
    const updated = this.repo.merge(entity, mappedData);
    const saved = await this.repo.save(updated);
    return this.mapper.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Impossible de supprimer l'id ${id}`);
  }

  async resetPassword(id: string): Promise<{ tempPassword: string }> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Utilisateur avec l'id ${id} introuvable`);

    const tempPassword = this.generateTemporaryPassword();
    entity.passwordHash = this.hashPassword(tempPassword);
    await this.repo.save(entity);

    // TODO: Envoyer un email avec le lien de réinitialisation
    // await this.emailService.sendPasswordResetEmail(entity.email);

    return { tempPassword };
  }

  private generateTemporaryPassword(): string {
    return crypto.randomBytes(12).toString('base64').slice(0, 16);
  }

  private hashPassword(password: string): string {
    // TODO: Utiliser bcrypt ou argon2 pour le hachage réel
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
