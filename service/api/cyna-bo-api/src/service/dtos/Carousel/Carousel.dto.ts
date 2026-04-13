import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CarouselImageDto {
  id: string;
  url: string;
  altText: string;
}

export class CarouselItemDto {
  id: string;
  image: CarouselImageDto;
  title: string;
  text: string;
  link: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUpdateCarouselItemDto {
  @IsString()
  @IsOptional()
  imageId?: string;

  @IsString()
  @IsOptional()
  imageAlt?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
