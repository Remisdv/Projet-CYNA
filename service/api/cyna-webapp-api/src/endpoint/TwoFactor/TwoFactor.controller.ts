import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Headers,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { TwoFactorService, TwoFactorType, TwoFactorMethodStatus } from '../../service/TwoFactor/TwoFactor.service';
import {
  EnableTwoFactorDto,
  ConfirmTwoFactorDto,
  DisableTwoFactorDto,
  ChallengeTwoFactorDto,
} from '../../service/TwoFactor/dtos/TwoFactor.dto';

function assertType(type: string): TwoFactorType {
  if (type !== 'email' && type !== 'totp') {
    throw new BadRequestException(`Type 2FA invalide: ${type}`);
  }
  return type;
}

@Controller('account/two-factor-methods')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get()
  async list(@Headers('x-user-id') userId: string): Promise<TwoFactorMethodStatus[]> {
    return this.twoFactorService.list(userId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async enable(
    @Headers('x-user-id') userId: string,
    @Body() dto: EnableTwoFactorDto,
  ) {
    return this.twoFactorService.enable(userId, dto.type, dto.password);
  }

  @Patch(':type')
  @HttpCode(HttpStatus.OK)
  async confirm(
    @Headers('x-user-id') userId: string,
    @Param('type') type: string,
    @Body() dto: ConfirmTwoFactorDto,
  ): Promise<{ message: string }> {
    return this.twoFactorService.confirm(userId, assertType(type), dto.password, dto.code);
  }

  @Delete(':type')
  @HttpCode(HttpStatus.OK)
  async disable(
    @Headers('x-user-id') userId: string,
    @Param('type') type: string,
    @Body() dto: DisableTwoFactorDto,
  ): Promise<{ message: string }> {
    return this.twoFactorService.disable(userId, assertType(type), dto.password, dto.code);
  }

  @Post(':type/challenges')
  @HttpCode(HttpStatus.OK)
  async challenge(
    @Headers('x-user-id') userId: string,
    @Param('type') type: string,
    @Body() dto: ChallengeTwoFactorDto,
  ): Promise<{ message: string }> {
    return this.twoFactorService.challenge(userId, assertType(type), dto.password);
  }
}
