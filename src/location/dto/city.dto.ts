import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateAndUpdateCityDto {
  @IsNotEmpty({ message: "City name is required" })
  @IsString({ message: "City name must be a valid string" })
  @MinLength(2, { message: "City name must have at least 2 characters" })
  @MaxLength(100, { message: "City name cannot exceed 100 characters" })
  name: string;

  @IsNotEmpty({ message: "Department ID is required" })
  @IsNumber({}, { message: "Department ID must be a valid number" })
  departmentId: number;
}
