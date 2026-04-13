import { IsString, IsNumber, IsOptional } from 'class-validator';

export class FaqDto {
  id: string;
  parentId: string;
  question: string;
  answer: string;
  lang: string;
  order: number;
  children: FaqDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUpdateFaqDto {
  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  question: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsString()
  @IsOptional()
  lang?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class ReorderFaqDto {
  @IsNumber()
  order: number;
}
