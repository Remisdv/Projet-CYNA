export class CreateUpdateTextePromotionnelDto {
  titre: string;
  description: string;
  isActive: boolean;
}

export class TextePromotionnelDto extends CreateUpdateTextePromotionnelDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
