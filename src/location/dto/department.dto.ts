import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateAndUpdateDepartmentDto {
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
