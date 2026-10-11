import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

/** Lo que el frontend envía */
export class ReqCreateRowDto {
  @ApiProperty({
    description: "Letra identificadora de la fila",
    example: "A",
    minLength: 1,
    maxLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 1)
  letter: string;

  @ApiPropertyOptional({
    description: "Indica si la fila es VIP",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVip?: boolean;

  @ApiPropertyOptional({
    description: "Número de sala",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  roomNumber?: number;
}

export class ReqUpdateRowDto {
  @ApiPropertyOptional({
    description: "Nueva letra identificadora de la fila",
    example: "B",
    minLength: 1,
    maxLength: 1,
  })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  letter?: string;

  @ApiPropertyOptional({
    description: "Indica si la fila es VIP",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVip?: boolean;

  @ApiPropertyOptional({
    description: "Número de sala",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  roomNumber?: number;
}

/** Uso interno (dao) */
export class CreateRowDto {
  @ApiProperty({
    description: "Letra identificadora de la fila",
    example: "A",
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 1)
  letter: string;

  @ApiPropertyOptional({
    description: "Indica si la fila es VIP",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isVip?: boolean;

  @ApiProperty({
    description: "ID de la sala",
    example: 1,
  })
  @IsNumber()
  roomId: number;
}

export class UpdateRowDto {
  @ApiPropertyOptional({
    description: "Nueva letra identificadora de la fila",
    example: "B",
  })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  letter?: string;

  @ApiPropertyOptional({
    description: "Indica si la fila es VIP",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVip?: boolean;

  @ApiPropertyOptional({
    description: "ID de la sala",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  roomId?: number;
}
