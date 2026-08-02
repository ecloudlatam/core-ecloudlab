import { IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  barcode: string;

  @IsString()
  unit_type: string;

  @IsNumber()
  @IsOptional()
  unit_quantity: number = 0;

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

  @IsString()
  @IsOptional()
  img_barcode?: string;
}

// 2. Extender agregando el nuevo campo
export type CreateVariantWithExtraDto = Omit<CreateVariantDto, 'barcode'> & {
  product_id?: string;
};

export class CreateProductBarcodeDto {
  @IsString()
  barcode: string;

  @IsString()
  @IsOptional()
  img_barcode: string;

  @IsUUID('4', { message: 'El id de la categoría debe ser un UUID v4 válido' })
  product_variant_id: string;
}
