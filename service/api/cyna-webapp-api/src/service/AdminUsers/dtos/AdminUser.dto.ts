import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { WebappUserStatus } from '../../../database/entity/WebappUser/WebappUser.entity';

export class AdminUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: WebappUserStatus;
  twoFactorEnabled: boolean;
  totpEnabled: boolean;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminUserListDto {
  items: AdminUserDto[];
  total: number;
  page: number;
  limit: number;
}

export class AdminCreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(128)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(128)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEnum(WebappUserStatus)
  status?: WebappUserStatus;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEnum(WebappUserStatus)
  status?: WebappUserStatus;

  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}
