import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateAndUpdateCityDto {
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
