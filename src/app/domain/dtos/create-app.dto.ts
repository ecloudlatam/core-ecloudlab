// src/app/domain/dtos/create-app.dto.ts
import { IsString, IsNotEmpty, IsIn, IsOptional, IsInt } from 'class-validator';

export class CreateAppDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsIn([0, 1], { message: 'El status debe ser un valor numérico: 0 (inactivo) o 1 (activo)' })
  status: 0 | 1;

}