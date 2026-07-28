import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateProductPriceDto {
  @IsUUID('4', { message: 'El id de la categoría debe ser un UUID v4 válido' })
  @IsOptional()
  product_id: string;

  @IsNumber()
  @Min(0)
  price_buy: number;

  @IsNumber()
  @Min(0)
  price_sell: number;
}
