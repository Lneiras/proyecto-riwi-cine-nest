import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class ReqCreateCinemaDto {
  @ApiProperty({
    description: "Nombre del cine",
    example: "Cine Colombia Santa Fe",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Tipo de cine o complejo",
    example: "Multiplex",
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({
    description: "Nombre de la ciudad en la que se ubica el cine",
    example: "Medellín",
  })
  @IsOptional()
  @IsString()
  cityName?: string;

  @ApiProperty({
    description: "Dirección física del cine",
    example: "Calle 14 Sur # 48-12",
  })
  @IsString()
  address: string;
}

export class CreateCinemaDto {
  @ApiProperty({
    description: "Nombre del cine",
    example: "Cine Colombia Santa Fe",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Tipo de cine",
    example: "Multiplex",
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: "ID de la ciudad",
    example: 1,
  })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "Dirección física del cine",
    example: "Calle 14 Sur # 48-12",
  })
  @IsString()
  address: string;
}

export class ReqUpdateCinemaDto {
  @ApiPropertyOptional({
    description: "Nuevo nombre del cine",
    example: "Cine Colombia Santa Fe",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Tipo de cine",
    example: "VIP Multiplex",
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "Nombre de la ciudad",
    example: "Medellín",
  })
  @IsOptional()
  @IsString()
  cityName?: string;

  @ApiPropertyOptional({
    description: "Dirección física del cine",
    example: "Calle 14 Sur # 48-12",
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateCinemaDto {
  @ApiPropertyOptional({
    description: "Nuevo nombre del cine",
    example: "Cine Colombia Santa Fe",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Tipo de cine",
    example: "VIP Multiplex",
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "ID de la ciudad",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiPropertyOptional({
    description: "Dirección física del cine",
    example: "Calle 14 Sur # 48-12",
  })
  @IsOptional()
  @IsString()
  address?: string;
}
