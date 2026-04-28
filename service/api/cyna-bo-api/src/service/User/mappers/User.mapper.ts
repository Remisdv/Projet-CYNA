import { Injectable } from '@nestjs/common';
import { User } from '../../database/entity/User/User.entity';
import { UserDto, CreateUserDto, UpdateUserDto } from '../dtos/User/User.dto';

@Injectable()
export class UserMapper {
  toDto(entity: User): UserDto {
    const dto = new UserDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.role = entity.role;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  toDtoArray(entities: User[]): UserDto[] {
    return entities.map(entity => this.toDto(entity));
  }

  toEntity(dto: CreateUserDto): Partial<User> {
    const entity = new User();
    entity.email = dto.email;
    entity.firstName = dto.firstName;
    entity.lastName = dto.lastName;
    entity.role = dto.role;
    entity.status = dto.status;
    return entity;
  }

  toUpdateEntity(dto: UpdateUserDto): Partial<User> {
    const entity = new User();
    if (dto.email) entity.email = dto.email;
    if (dto.firstName) entity.firstName = dto.firstName;
    if (dto.lastName) entity.lastName = dto.lastName;
    if (dto.role) entity.role = dto.role;
    if (dto.status) entity.status = dto.status;
    return entity;
  }
}
