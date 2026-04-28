import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { WebappUserRepository } from '../../repository/WebappUser/WebappUser.repository';
import { AccountMapper } from './mappers/Account.mapper';
import { UpdateProfileDto, ChangePasswordDto, ProfileResponseDto } from './dtos/Account.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly userRepository: WebappUserRepository,
    private readonly mapper: AccountMapper,
  ) { }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.mapper.toProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.billingAddress !== undefined) user.billingAddress = dto.billingAddress;
    if (dto.shippingAddress !== undefined) user.shippingAddress = dto.shippingAddress;

    const saved = await this.userRepository.save(user);
    return this.mapper.toProfile(saved);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const currentHash = crypto.createHash('sha256').update(dto.currentPassword).digest('hex');
    if (currentHash !== user.passwordHash) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    user.passwordHash = crypto.createHash('sha256').update(dto.newPassword).digest('hex');
    await this.userRepository.save(user);
  }
}
