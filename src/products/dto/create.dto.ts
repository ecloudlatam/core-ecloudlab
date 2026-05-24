import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsArray, IsBoolean, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsUUID('4', { message: 'El id de la categoría debe ser un UUID v4 válido' })
  category_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  is_available?: boolean;
}