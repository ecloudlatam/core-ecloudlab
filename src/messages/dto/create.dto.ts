import { IsEmail, IsPhoneNumber, IsString, IsUUID } from 'class-validator';

export class createUserDto {
  @IsString()
  name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  reference_id: number;

  @IsUUID('4')
  app_id: string;
}
