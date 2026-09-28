import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
export class CreateAndUpdateCountryDto {
  @IsNotEmpty({ message: "Country name is required" })
  @IsString({ message: "Country name must be a valid string" })
  @MinLength(3)
  @MaxLength(100)
  name: string;
}
