import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh Token válido emitido previamente por el sistema",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsNotEmpty({ message: "El refreshToken es requerido" })
  @IsString({ message: "El refreshToken debe ser una cadena de texto" })
  refreshToken: string;
}
