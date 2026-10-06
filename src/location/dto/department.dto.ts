import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class ReqCreateDepartmentDto {
  @ApiProperty({
    description: "Nombre del departamento o estado",
    example: "Antioquia",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "Department name is required" })
  @IsString({ message: "Department name must be a valid string" })
  @MinLength(2, { message: "Department name must have at least 2 characters" })
  @MaxLength(100, { message: "Department name cannot exceed 100 characters" })
  name: string;

  @ApiPropertyOptional({
    description: "Nombre del país al que pertenece el departamento",
    example: "Colombia",
  })
  @IsOptional()
  @IsString({ message: "Country name must be a valid string" })
  countryName?: string;
}

export class CreateDepartmentDto {
  @ApiProperty({
    description: "Nombre del departamento o estado",
    example: "Antioquia",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "Department name is required" })
  @IsString({ message: "Department name must be a valid string" })
  @MinLength(2, { message: "Department name must have at least 2 characters" })
  @MaxLength(100, { message: "Department name cannot exceed 100 characters" })
  name: string;

  @ApiProperty({
    description: "ID del país al que pertenece el departamento",
    example: 1,
  })
  @IsNotEmpty({ message: "Country ID is required" })
  @IsNumber({}, { message: "Country ID must be a valid number" })
  countryId: number;
}

export class ReqUpdateDepartmentDto {
  @ApiPropertyOptional({
    description: "Nuevo nombre del departamento o estado",
    example: "Antioquia",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "Department name must be a valid string" })
  @MinLength(2, { message: "Department name must have at least 2 characters" })
  @MaxLength(100, { message: "Department name cannot exceed 100 characters" })
  name?: string;

  @ApiPropertyOptional({
    description: "Nombre del país al que pertenece el departamento",
    example: "Colombia",
  })
  @IsOptional()
  @IsString({ message: "Country name must be a valid string" })
  countryName?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: "Nuevo nombre del departamento o estado",
    example: "Antioquia",
  })
  @IsOptional()
  @IsString({ message: "Department name must be a valid string" })
  @MinLength(2, { message: "Department name must have at least 2 characters" })
  @MaxLength(100, { message: "Department name cannot exceed 100 characters" })
  name?: string;

  @ApiPropertyOptional({
    description: "ID del país al que pertenece el departamento",
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: "Country ID must be a valid number" })
  countryId?: number;
}
