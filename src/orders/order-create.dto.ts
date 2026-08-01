import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class orderDetailsDto {
  @IsNumber()
  @IsOptional()
  order_id: number;

  @IsString()
  barcode: string;

  @IsNumber()
  total: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class OrderCreateDto {
  @IsNumber()
  reference_id: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => orderDetailsDto)
  items: orderDetailsDto[];

  @IsNumber()
  total: number;
}
