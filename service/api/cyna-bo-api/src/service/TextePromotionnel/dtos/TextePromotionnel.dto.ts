import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateUpdateTextePromotionnelDto {
  @IsString()
  @MaxLength(500)
  textFr: string;

  @IsString()
  @MaxLength(500)
  textEn: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class PatchTextePromotionnelDto {
  @IsString()
  @MaxLength(500)
  @IsOptional()
  textFr?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  textEn?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class TextePromotionnelDto {
  id: string;
  textFr: string;
  textEn: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
