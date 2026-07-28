import { IsNotEmpty, IsString } from 'class-validator';

export class CategoriesDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
