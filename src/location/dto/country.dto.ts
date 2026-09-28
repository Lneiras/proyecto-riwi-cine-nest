import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAndUpdateCountryDto {
  @ApiProperty({
    description: "Nombre del país",
    example: "Colombia",
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "Country name is required" })
  @IsString({ message: "Country name must be a valid string" })
  @MinLength(3, { message: "Country name must have at least 3 characters" })
  @MaxLength(100, { message: "Country name cannot exceed 100 characters" })
  name: string;
}
