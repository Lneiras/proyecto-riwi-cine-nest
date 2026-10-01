import { ApiProperty } from "@nestjs/swagger";

export class UserSummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ example: "usuario@ejemplo.com" })
  email: string;

  @ApiProperty({ example: "Laura Neira" })
  name: string;

  @ApiProperty({ example: "client" })
  role: string;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "Access Token firmado (JWT) con tiempo de vida de 15 minutos",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description:
      "Refresh Token seguro persistido en base de datos con tiempo de vida de 7 días",
    example: "d3b07384d113edec49eaa6238ad5ff00...",
  })
  refreshToken: string;

  @ApiProperty({
    description: "Tipo de token de autenticación",
    example: "Bearer",
  })
  tokenType: string;

  @ApiProperty({
    description: "Tiempo de expiración del access token en segundos",
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description: "Datos esenciales del usuario autenticado",
    type: UserSummaryDto,
  })
  user: UserSummaryDto;
}
