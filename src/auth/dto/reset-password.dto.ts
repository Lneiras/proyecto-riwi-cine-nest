import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({
    description: "Token de restablecimiento recibido por el usuario",
    example: "a8f5b4c3d2e1...",
  })
  @IsNotEmpty({ message: "El token es requerido" })
  @IsString({ message: "El token debe ser una cadena de texto" })
  token: string;

  @ApiProperty({
    description: "Nueva contraseña de la cuenta",
    example: "NuevaClaveSegura2026*",
    minLength: 6,
  })
  @IsNotEmpty({ message: "La nueva contraseña es requerida" })
  @IsString({ message: "La nueva contraseña debe ser una cadena de texto" })
  @MinLength(6, {
    message: "La nueva contraseña debe tener al menos 6 caracteres",
  })
  newPassword: string;
}
