import { IsString, IsBoolean, MaxLength } from 'class-validator';

export class CreateUpdateTextePromotionnelDto {
  @IsString()
  @MaxLength(500)
  textFr: string;

  @IsString()
  @MaxLength(500)
  textEn: string;
}

export class TextePromotionnelDto extends CreateUpdateTextePromotionnelDto {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
