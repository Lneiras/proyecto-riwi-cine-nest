import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import type { User } from "../entities/user.entity.js";
import { AuthService } from "../services/auth.service.js";
import { AuditService } from "../services/audit.service.js";
import { LoginDto } from "../dto/login.dto.js";
import { RegisterDto } from "../dto/register.dto.js";
import { RefreshTokenDto } from "../dto/refresh-token.dto.js";
import { ForgotPasswordDto } from "../dto/forgot-password.dto.js";
import { ResetPasswordDto } from "../dto/reset-password.dto.js";
import { AuthResponseDto } from "../dto/auth-response.dto.js";
import { JwtAuthGuard } from "../guards/jwt-auth.guard.js";

function extractClientInfo(req: Request): { ip: string; userAgent: string } {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = "127.0.0.1";

  if (typeof forwarded === "string") {
    ip = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ip = forwarded[0].trim();
  } else if (req.ip) {
    ip = req.ip;
  } else if (req.socket?.remoteAddress) {
    ip = req.socket.remoteAddress;
  }

  const userAgent = req.headers["user-agent"] || "Unknown";
  return { ip, userAgent };
}

// Request de Express al que Passport le agrega el usuario autenticado
interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Post("register")
  @ApiOperation({
    summary: "Registrar un nuevo usuario en la plataforma",
    description:
      "Crea una nueva cuenta de usuario. Por defecto, el correo queda pendiente de verificación.",
  })
  @ApiResponse({ status: 201, description: "Usuario registrado con éxito" })
  @ApiResponse({ status: 409, description: "Correo electrónico ya registrado" })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.register(dto, ip, userAgent);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Inicio de sesión seguro (Task 1 / Escenario 1, 2 y 3)",
    description:
      "Autentica al usuario. Si las credenciales son válidas y el correo está verificado, emite Access Token (JWT, 15m), Refresh Token (7d) e invalida los tokens anteriores. Si se acumulan 5 intentos fallidos consecutivos, bloquea la cuenta por 15 minutos.",
  })
  @ApiResponse({
    status: 200,
    description: "Inicio de sesión exitoso. Retorna Access y Refresh Token.",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description:
      "Credenciales inválidas, correo no verificado o cuenta bloqueada por 5 intentos fallidos",
  })
  @ApiResponse({
    status: 429,
    description:
      "Cuenta o IP temporalmente bloqueada por exceso de intentos fallidos (15 min)",
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.login(dto, ip, userAgent);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Renovación de sesión con Refresh Token (Task 2 / Escenario 4)",
    description:
      "Emite un nuevo Access Token (15m) e invalida/rota el Refresh Token anterior sin requerir reingresar credenciales.",
  })
  @ApiResponse({
    status: 200,
    description: "Tokens renovados exitosamente",
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token inválido, revocado o expirado",
  })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.refreshToken(dto, ip, userAgent);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Cierre de sesión seguro (Task 2)",
    description:
      "Revoca el Refresh Token actual en la base de datos para terminar la sesión.",
  })
  @ApiResponse({ status: 200, description: "Sesión cerrada exitosamente" })
  async logout(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.logout(dto, ip, userAgent);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Solicitud de restablecimiento de contraseña (Task 2)",
    description:
      "Genera un token de recuperación con vigencia de 15 minutos para el correo especificado.",
  })
  @ApiResponse({
    status: 200,
    description: "Instrucciones de restablecimiento enviadas",
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.forgotPassword(dto, ip, userAgent);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Restablecer contraseña con token (Task 2)",
    description:
      "Actualiza la contraseña del usuario, desbloquea la cuenta e invalida las sesiones activas.",
  })
  @ApiResponse({
    status: 200,
    description: "Contraseña actualizada exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Token inválido, expirado o ya utilizado",
  })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    const { ip, userAgent } = extractClientInfo(req);
    return this.authService.resetPassword(dto, ip, userAgent);
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verificar correo electrónico (Activación de cuenta)",
    description:
      "Marca el correo del usuario como verificado para habilitar el inicio de sesión.",
  })
  @ApiResponse({ status: 200, description: "Correo verificado exitosamente" })
  async verifyEmail(@Body("email") email: string) {
    return this.authService.verifyEmail(email);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Consultar datos del usuario autenticado (Protegido con JWT)",
  })
  @ApiResponse({ status: 200, description: "Información del usuario actual" })
  @ApiResponse({
    status: 401,
    description: "Token no proporcionado o inválido",
  })
  getProfile(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
  }

  @Get("audit")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Consultar historial de auditoría de accesos del usuario (Task 4)",
    description:
      "Retorna los registros de auditoría de acceso asociados al usuario autenticado.",
  })
  @ApiResponse({ status: 200, description: "Lista de registros de auditoría" })
  async getAuditLogs(@Req() req: AuthenticatedRequest) {
    return this.auditService.getUserAuditLogs(req.user.id);
  }
}
