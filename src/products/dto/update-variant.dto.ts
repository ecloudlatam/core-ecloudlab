import { IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class udpateProductVariantDto {
  @IsUUID('4', { message: 'El id de la categoría debe ser un UUID v4 válido' })
  product_id: string;

  @IsString()
  sku: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsNumber()
  @Min(0)
  price_buy: number;

  @IsNumber()
  @Min(0)
  price_sell: number;

  @IsString()
  unit_type: string;
}
