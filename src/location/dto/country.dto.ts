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
  @MinLength(3)
  @MaxLength(100)
  name: string;
}
