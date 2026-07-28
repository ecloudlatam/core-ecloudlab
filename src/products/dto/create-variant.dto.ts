import { IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  sku: string;

  @IsString()
  unit_type: string;

  @IsString()
  stock: string;

  @IsNumber()
  @Min(0)
  price_buy: number;

  @IsNumber()
  @Min(0)
  price_sell: number;

  @IsNumber()
  @Min(0)
  tax_rate: number;

  @IsString()
  @IsOptional()
  image_url?: string;
}

// 2. Nueva clase heredada en el mismo archivo
export class CreateVariantWithExtraDto extends CreateVariantDto {
  @IsUUID('4', { message: 'El id de la categoría debe ser un UUID v4 válido' })
  product_id?: string; // Tu nuevo campo adicional
}
