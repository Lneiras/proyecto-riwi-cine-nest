import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString, Length } from "class-validator";

/** Lo que el frontend envía */
export class ReqCreateSeatsDto {
  @ApiProperty({
    description: "Número de asiento en la fila",
    example: 5,
  })
  @IsNumber()
  number: number;

  @ApiProperty({
    description: "Indica si es un asiento preferencial",
    example: false,
    default: false,
  })
  @IsBoolean()
  isPreferential: boolean;

  @ApiPropertyOptional({
    description: "Letra de la fila",
    example: "A",
  })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  rowLetter?: string;
}

export class ReqUpdateSeatsDto {
  @ApiPropertyOptional({
    description: "Nuevo número de asiento en la fila",
    example: 6,
  })
  @IsOptional()
  @IsNumber()
  number?: number;

  @ApiPropertyOptional({
    description: "Indica si es un asiento preferencial",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPreferential?: boolean;

  @ApiPropertyOptional({
    description: "Letra de la fila",
    example: "A",
  })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  rowLetter?: string;
}

/** Uso interno (dao) */
export class CreateSeatsDto {
  @ApiProperty({
    description: "Número de asiento en la fila",
    example: 5,
  })
  @IsNumber()
  number: number;

  @ApiProperty({
    description: "Indica si es un asiento preferencial",
    example: false,
  })
  @IsBoolean()
  isPreferential: boolean;

  @ApiProperty({
    description: "ID de la fila",
    example: 1,
  })
  @IsNumber()
  rowId: number;
}

export class UpdateSeatsDto {
  @ApiPropertyOptional({
    description: "Nuevo número de asiento en la fila",
    example: 6,
  })
  @IsOptional()
  @IsNumber()
  number?: number;

  @ApiPropertyOptional({
    description: "Indica si es un asiento preferencial",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPreferential?: boolean;

  @ApiPropertyOptional({
    description: "ID de la fila",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  rowId?: number;
}
