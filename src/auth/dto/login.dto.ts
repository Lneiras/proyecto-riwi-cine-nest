import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "Correo electrónico registrado",
    example: "usuario@ejemplo.com",
  })
  @IsNotEmpty({ message: "El correo electrónico es requerido" })
  @IsEmail({}, { message: "El correo electrónico no tiene un formato válido" })
  email: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "ClaveSegura123*",
    minLength: 6,
  })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString({ message: "La contraseña debe ser una cadena de texto" })
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password: string;
}
