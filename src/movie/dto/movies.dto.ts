import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { MovieClassification } from "../entities/movie.entity.js";
import { FunctionLanguage } from "../entities/function.entity.js";

// Query params de GET /movies/weekly y GET /movies/today.
// La cartelera siempre es de UNA ciudad (la que eligió el usuario en HU-002),
// por eso cityId es obligatorio.
export class BillboardQueryDto {
  @ApiProperty({
    description: "ID de la ciudad seleccionada por el usuario",
    example: 1,
  })
  // El ValidationPipe global (enableImplicitConversion) convierte "1" en 1.
  @IsInt({ message: "cityId must be an integer" })
  @Min(1, { message: "cityId must be greater than 0" })
  cityId: number;

  // Paginación (HU-003 Task 3). Ambos son opcionales:
  // si no se envían, se usan los valores por defecto (página 1, 10 películas).
  @ApiPropertyOptional({
    description: "Número de página (empieza en 1)",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: "page must be an integer" })
  @Min(1, { message: "page must be greater than 0" })
  page: number = 1;

  @ApiPropertyOptional({
    description: "Cantidad de películas por página (máximo 50)",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt({ message: "limit must be an integer" })
  @Min(1, { message: "limit must be greater than 0" })
  // Un máximo evita que alguien pida limit=100000 y sobrecargue la BD.
  @Max(50, { message: "limit cannot be greater than 50" })
  limit: number = 10;
}

// Query params de GET /movies/filter.
// Hereda cityId, page y limit, y agrega los filtros opcionales:
// todos se pueden combinar.
export class MovieFilterQueryDto extends BillboardQueryDto {
  @ApiPropertyOptional({
    description:
      "Fecha exacta (YYYY-MM-DD) dentro de los próximos 7 días. Si no se envía, se busca en toda la semana",
    example: "2026-10-16",
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "date must have the format YYYY-MM-DD",
  })
  // strict: rechaza fechas que no existen, como 2026-02-30.
  @IsISO8601({ strict: true }, { message: "date must be a valid date" })
  date?: string;

  @ApiPropertyOptional({
    description: "Género de la película (no distingue mayúsculas)",
    example: "Ciencia ficción",
  })
  @IsOptional()
  @IsString({ message: "genre must be a valid string" })
  @MaxLength(50, { message: "genre cannot exceed 50 characters" })
  genre?: string;

  @ApiPropertyOptional({
    description: "Clasificación por edad",
    enum: MovieClassification,
    example: MovieClassification.MAYORES_12,
  })
  @IsOptional()
  @IsEnum(MovieClassification, {
    message: `classification must be one of: ${Object.values(MovieClassification).join(", ")}`,
  })
  classification?: MovieClassification;

  @ApiPropertyOptional({
    description: "Idioma de la función",
    enum: FunctionLanguage,
    example: FunctionLanguage.SUBTITULADA,
  })
  @IsOptional()
  @IsEnum(FunctionLanguage, {
    message: `language must be one of: ${Object.values(FunctionLanguage).join(", ")}`,
  })
  language?: FunctionLanguage;

  @ApiPropertyOptional({
    description: "Nombre del formato (no distingue mayúsculas)",
    example: "IMAX",
  })
  @IsOptional()
  @IsString({ message: "format must be a valid string" })
  @MaxLength(30, { message: "format cannot exceed 30 characters" })
  format?: string;

  @ApiPropertyOptional({ description: "ID del complejo (cine)", example: 1 })
  @IsOptional()
  @IsInt({ message: "cinemaId must be an integer" })
  @Min(1, { message: "cinemaId must be greater than 0" })
  cinemaId?: number;

  @ApiPropertyOptional({ description: "ID de la sala", example: 1 })
  @IsOptional()
  @IsInt({ message: "roomId must be an integer" })
  @Min(1, { message: "roomId must be greater than 0" })
  roomId?: number;
}

// Query param de GET /movies/:id (HU-004). Igual que weekly/today/filter,
// la ciudad se envía como cityId numérico.
export class MovieDetailQueryDto {
  @ApiPropertyOptional({
    description:
      "Ciudad seleccionada. Si se envía, las funciones, idiomas y formatos se acotan a esa ciudad",
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: "cityId must be an integer" })
  @Min(1, { message: "cityId must be greater than 0" })
  cityId?: number;
}

// Query param de GET /movies/:id/recommendations (HU-004).
export class RecommendationsQueryDto {
  @ApiPropertyOptional({
    description: "Cantidad máxima de recomendaciones",
    example: 6,
    default: 6,
  })
  @IsOptional()
  @IsInt({ message: "limit must be an integer" })
  @Min(1, { message: "limit must be greater than 0" })
  @Max(20, { message: "limit cannot be greater than 20" })
  limit: number = 6;
}
