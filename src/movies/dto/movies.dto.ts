import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateMovieDto {
  @ApiProperty({
    description: "Nombre de la película",
    example: "Dune: Parte Dos",
    minLength: 2,
    maxLength: 150,
  })
  @IsNotEmpty({ message: "Movie name is required" })
  @IsString({ message: "Movie name must be a valid string" })
  @MinLength(2, { message: "Movie name must have at least 2 characters" })
  @MaxLength(150, { message: "Movie name cannot exceed 150 characters" })
  name: string;

  @ApiProperty({ description: "Duración en minutos", example: 155 })
  @Type(() => Number)
  @IsNumber({}, { message: "Duration must be a valid number" })
  @Min(1, { message: "Duration must be at least 1 minute" })
  durationMinutes: number;

  @ApiProperty({ description: "Clasificación por edades", example: "PG-13" })
  @IsNotEmpty({ message: "Rating is required" })
  @IsString({ message: "Rating must be a valid string" })
  @MaxLength(10)
  rating: string;

  @ApiProperty({
    description: "Géneros de la película",
    example: ["Ciencia ficción", "Aventura"],
    type: [String],
  })
  @IsArray({ message: "Genres must be an array" })
  @IsString({ each: true, message: "Each genre must be a valid string" })
  genres: string[];

  @ApiPropertyOptional({ description: "Sinopsis completa" })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional({ description: "Director de la película", example: "Denis Villeneuve" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  director?: string;

  @ApiPropertyOptional({
    description: "Actores principales",
    example: ["Timothée Chalamet", "Zendaya"],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: "Actors must be an array" })
  @IsString({ each: true, message: "Each actor must be a valid string" })
  actors?: string[];

  @ApiPropertyOptional({ description: "Fecha de estreno (YYYY-MM-DD)", example: "2026-03-01" })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ description: "URL del poster oficial" })
  @IsOptional()
  @IsUrl({}, { message: "Poster URL must be a valid URL" })
  posterUrl?: string;

  @ApiPropertyOptional({ description: "URL del banner" })
  @IsOptional()
  @IsUrl({}, { message: "Banner URL must be a valid URL" })
  bannerUrl?: string;

  @ApiPropertyOptional({ description: "URL del tráiler oficial (YouTube)" })
  @IsOptional()
  @IsUrl({}, { message: "Trailer URL must be a valid URL" })
  trailerUrl?: string;

  @ApiPropertyOptional({ description: "Calificación promedio del público (0-5)", default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  averageRating?: number;
}

export class UpdateMovieDto {
  @ApiPropertyOptional({ description: "Nombre de la película", example: "Dune: Parte Dos" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ description: "Duración en minutos", example: 155 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: "Clasificación por edades", example: "PG-13" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  rating?: string;

  @ApiPropertyOptional({ description: "Géneros de la película", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @ApiPropertyOptional({ description: "Sinopsis completa" })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional({ description: "Director de la película" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  director?: string;

  @ApiPropertyOptional({ description: "Actores principales", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actors?: string[];

  @ApiPropertyOptional({ description: "Fecha de estreno (YYYY-MM-DD)" })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ description: "URL del poster oficial" })
  @IsOptional()
  @IsUrl({}, { message: "Poster URL must be a valid URL" })
  posterUrl?: string;

  @ApiPropertyOptional({ description: "URL del banner" })
  @IsOptional()
  @IsUrl({}, { message: "Banner URL must be a valid URL" })
  bannerUrl?: string;

  @ApiPropertyOptional({ description: "URL del tráiler oficial (YouTube)" })
  @IsOptional()
  @IsUrl({}, { message: "Trailer URL must be a valid URL" })
  trailerUrl?: string;

  @ApiPropertyOptional({ description: "Calificación promedio del público (0-5)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  averageRating?: number;
}

export class MovieDetailQueryDto {
  @ApiPropertyOptional({
    description:
      "Ciudad seleccionada por el visitante. Si se envía, formatos, idiomas, funciones y precios se acotan a esa ciudad",
    example: "Medellín",
  })
  @IsOptional()
  @IsString()
  cityName?: string;
}

export class RecommendationsQueryDto {
  @ApiPropertyOptional({ description: "Cantidad máxima de recomendaciones", default: 6, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  limit: number = 6;
}
