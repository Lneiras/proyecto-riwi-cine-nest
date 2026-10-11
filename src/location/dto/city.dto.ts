import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class ReqCreateCityDto {
  @ApiProperty({
    description: "Nombre de la ciudad",
    example: "Medellín",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "City name is required" })
  @IsString({ message: "City name must be a valid string" })
  @MinLength(2, { message: "City name must have at least 2 characters" })
  @MaxLength(100, { message: "City name cannot exceed 100 characters" })
  name: string;

  @ApiPropertyOptional({
    description: "Nombre del departamento al que pertenece la ciudad",
    example: "Antioquia",
  })
  @IsOptional()
  @IsString({ message: "Department name must be a valid string" })
  departmentName?: string;
}

export class CreateCityDto {
  @ApiProperty({
    description: "Nombre de la ciudad",
    example: "Medellín",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "City name is required" })
  @IsString({ message: "City name must be a valid string" })
  @MinLength(2, { message: "City name must have at least 2 characters" })
  @MaxLength(100, { message: "City name cannot exceed 100 characters" })
  name: string;

  @ApiProperty({
    description: "ID del departamento al que pertenece la ciudad",
    example: 1,
  })
  @IsNotEmpty({ message: "Department ID is required" })
  @IsNumber({}, { message: "Department ID must be a valid number" })
  departmentId: number;
}

export class ReqUpdateCityDto {
  @ApiPropertyOptional({
    description: "Nuevo nombre de la ciudad",
    example: "Medellín",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "City name must be a valid string" })
  @MinLength(2, { message: "City name must have at least 2 characters" })
  @MaxLength(100, { message: "City name cannot exceed 100 characters" })
  name?: string;

  @ApiPropertyOptional({
    description: "Nombre del departamento al que pertenece la ciudad",
    example: "Antioquia",
  })
  @IsOptional()
  @IsString({ message: "Department name must be a valid string" })
  departmentName?: string;
}

export class UpdateCityDto {
  @ApiPropertyOptional({
    description: "Nuevo nombre de la ciudad",
    example: "Medellín",
  })
  @IsOptional()
  @IsString({ message: "City name must be a valid string" })
  @MinLength(2, { message: "City name must have at least 2 characters" })
  @MaxLength(100, { message: "City name cannot exceed 100 characters" })
  name?: string;

  @ApiPropertyOptional({
    description: "ID del departamento al que pertenece la ciudad",
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: "Department ID must be a valid number" })
  departmentId?: number;
}
