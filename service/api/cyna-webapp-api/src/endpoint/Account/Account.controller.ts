import { Controller, Get, Put, Body, Headers } from '@nestjs/common';
import { AccountService } from '../../service/Account/Account.service';
import { UpdateProfileDto, ChangePasswordDto, ProfileResponseDto } from '../../dto/Account/Account.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @Get('profile')
  async getProfile(@Headers('x-user-id') userId: string): Promise<ProfileResponseDto> {
    return this.accountService.getProfile(userId);
  }

  @Put('profile')
  async updateProfile(
    @Headers('x-user-id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.accountService.updateProfile(userId, dto);
  }

  @Put('password')
  async changePassword(
    @Headers('x-user-id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.accountService.changePassword(userId, dto);
    return { message: 'Mot de passe modifié avec succès' };
  }
}
