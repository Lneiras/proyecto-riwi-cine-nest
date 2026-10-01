import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({
    description: "Nombre completo del usuario",
    example: "Laura Neira",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "El nombre no puede exceder 100 caracteres" })
  name: string;

  @ApiProperty({
    description: "Correo electrónico único para la cuenta",
    example: "usuario@ejemplo.com",
  })
  @IsNotEmpty({ message: "El correo electrónico es requerido" })
  @IsEmail({}, { message: "El correo electrónico no tiene un formato válido" })
  email: string;

  @ApiProperty({
    description: "Contraseña segura de acceso",
    example: "ClaveSegura123*",
    minLength: 6,
  })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString({ message: "La contraseña debe ser una cadena de texto" })
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password: string;

  @ApiPropertyOptional({
    description: "Rol asignado al usuario (client, admin)",
    example: "client",
    default: "client",
  })
  @IsOptional()
  @IsString({ message: "El rol debe ser una cadena de texto" })
  role?: string;
}
