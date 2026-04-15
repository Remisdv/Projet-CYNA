import { IsString, IsEmail, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(255)
  subject: string;

  @IsString()
  @MaxLength(5000)
  message: string;
}
