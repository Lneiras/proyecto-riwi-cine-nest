import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({
    description: "Correo electrónico del usuario para recuperar contraseña",
    example: "usuario@ejemplo.com",
  })
  @IsNotEmpty({ message: "El correo electrónico es requerido" })
  @IsEmail({}, { message: "El correo electrónico no tiene un formato válido" })
  email: string;
}
