import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { AudioType } from "../entities/showtime.entity.js";

/** Lo que recibe el controlador: identifica cine y sala por nombre/número. */
export class ReqCreateShowtimeDto {
  @ApiProperty({ description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @IsNotEmpty({ message: "Cinema name is required" })
  @IsString()
  cinemaName: string;

  @ApiProperty({ description: "Número de sala dentro del cine", example: 1 })
  @Type(() => Number)
  @IsInt({ message: "Room number must be an integer" })
  @Min(1)
  roomNumber: number;

  @ApiProperty({ description: "Idioma de la función", example: "Español" })
  @IsNotEmpty({ message: "Language is required" })
  @IsString()
  language: string;

  @ApiProperty({ enum: AudioType, description: "Doblada o subtitulada" })
  @IsEnum(AudioType)
  audioType: AudioType;

  @ApiProperty({
    description: "Fecha y hora de inicio (ISO 8601, con offset)",
    example: "2026-11-01T20:00:00-05:00",
  })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: "Valor de la entrada", example: 18000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}

export class ReqUpdateShowtimeDto {
  @ApiPropertyOptional({ description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @IsOptional()
  @IsString()
  cinemaName?: string;

  @ApiPropertyOptional({ description: "Número de sala dentro del cine", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomNumber?: number;

  @ApiPropertyOptional({ description: "Idioma de la función", example: "Español" })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: AudioType, description: "Doblada o subtitulada" })
  @IsOptional()
  @IsEnum(AudioType)
  audioType?: AudioType;

  @ApiPropertyOptional({ description: "Fecha y hora de inicio (ISO 8601, con offset)" })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ description: "Valor de la entrada" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: "Marcar la función como agotada (RN-015)" })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === true || value === "true")
  @IsBoolean()
  soldOut?: boolean;
}

/** Uso interno (dao): cine/sala ya resueltos a ids. */
export interface CreateShowtimeDto {
  movieId: number;
  roomId: number;
  language: string;
  audioType: AudioType;
  startsAt: Date;
  price: number;
}

export interface UpdateShowtimeDto {
  roomId?: number;
  language?: string;
  audioType?: AudioType;
  startsAt?: Date;
  price?: number;
  soldOut?: boolean;
}

export class FunctionsQueryDto {
  @ApiPropertyOptional({ description: "Ciudad a la que pertenece el cine", example: "Medellín" })
  @IsOptional()
  @IsString()
  cityName?: string;

  @ApiPropertyOptional({ description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @IsOptional()
  @IsString()
  cinemaName?: string;

  @ApiPropertyOptional({
    description: "Fecha de la función (YYYY-MM-DD, hora local de Colombia)",
    example: "2026-11-01",
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: "date must be in YYYY-MM-DD format" })
  date?: string;

  @ApiPropertyOptional({ description: "Idioma de la función", example: "Español" })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: AudioType, description: "Doblada o subtitulada" })
  @IsOptional()
  @IsEnum(AudioType)
  audioType?: AudioType;

  @ApiPropertyOptional({
    description: "Si es true, excluye las funciones marcadas como agotadas (RN-015)",
    default: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === true || value === "true")
  @IsBoolean()
  onlyAvailable?: boolean;
}
