import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateAndUpdateDepartmentDto {
  @IsNotEmpty({ message: "Department name is required" })
  @IsString({ message: "Department name must be a valid string" })
  @MinLength(2, { message: "Department name must have at least 2 characters" })
  @MaxLength(100, { message: "Department name cannot exceed 100 characters" })
  name: string;

  @IsNotEmpty({ message: "Country ID is required" })
  @IsNumber({}, { message: "Country ID must be a valid number" })
  countryId: number;
}
