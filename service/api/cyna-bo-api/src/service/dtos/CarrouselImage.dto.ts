export class CreateUpdateCarrouselImageDto {
  imageUrl: string;
  altText?: string;
  isActive: boolean;
}

export class CarrouselImageDto extends CreateUpdateCarrouselImageDto {
  id: number;
  createdAt: Date;
}
