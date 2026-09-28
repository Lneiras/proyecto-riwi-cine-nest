import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { UserDao } from "../dao/user.dao.js";
import { PasswordResetDao } from "../dao/password-reset.dao.js";
import { TokenService } from "./token.service.js";
import { AuditService } from "./audit.service.js";
import { LoginDto } from "../dto/login.dto.js";
import { RegisterDto } from "../dto/register.dto.js";
import { RefreshTokenDto } from "../dto/refresh-token.dto.js";
import { ForgotPasswordDto } from "../dto/forgot-password.dto.js";
import { ResetPasswordDto } from "../dto/reset-password.dto.js";
import { AuthResponseDto } from "../dto/auth-response.dto.js";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userDao: UserDao,
    private readonly passwordResetDao: PasswordResetDao,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
  ) {}

  async register(
    dto: RegisterDto,
    ip: string,
    userAgent: string,
    autoVerifyEmail: boolean = false,
  ) {
    const existing = await this.userDao.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        "Ya existe una cuenta registrada con este correo electrónico",
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userDao.create({
      name: dto.name,
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      role: dto.role || "client",
      isEmailVerified: autoVerifyEmail,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      isActive: true,
    });

    await this.auditService.logEvent({
      userId: user.id,
      email: user.email,
      action: "REGISTER",
      ipAddress: ip,
      userAgent,
      status: "SUCCESS",
      details: "Usuario registrado exitosamente",
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
  }

  async login(
    dto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<AuthResponseDto> {
    const cleanEmail = dto.email.toLowerCase().trim();

    // 1. Check IP blockage
    const ipCheck = this.auditService.isIpBlocked(ip);
    if (ipCheck.isBlocked) {
      await this.auditService.logEvent({
        email: cleanEmail,
        action: "LOGIN_BLOCKED_IP",
        ipAddress: ip,
        userAgent,
        status: "BLOCKED",
        details: `IP bloqueada temporalmente. Restante: ${ipCheck.remainingSeconds}s`,
      });
      throw new HttpException(
        "Dirección IP temporalmente bloqueada por exceso de intentos fallidos. Intente más tarde.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Find user by email
    const user = await this.userDao.findByEmail(cleanEmail);

    if (!user) {
      this.auditService.recordIpFailedAttempt(ip);
      await this.auditService.logEvent({
        email: cleanEmail,
        action: "LOGIN_FAILED",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        details: "Usuario no encontrado",
      });
      throw new UnauthorizedException("Credenciales inválidas");
    }

    // 3. Escenario 2: Check if account is temporarily locked
    const now = new Date();
    if (user.lockoutUntil && user.lockoutUntil > now) {
      const remainingMs = user.lockoutUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

      await this.auditService.logEvent({
        userId: user.id,
        email: user.email,
        action: "ACCOUNT_LOCKED",
        ipAddress: ip,
        userAgent,
        status: "BLOCKED",
        details: `Intento de acceso con cuenta bloqueada. Tiempo restante: ${remainingMinutes} min`,
      });

      throw new HttpException(
        `La cuenta se encuentra bloqueada temporalmente por 15 minutos debido a múltiples intentos fallidos. Intente de nuevo en ${remainingMinutes} minuto(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // If lockout time has passed, reset lockout state
    if (user.lockoutUntil && user.lockoutUntil <= now) {
      user.lockoutUntil = null;
      user.failedLoginAttempts = 0;
      await this.userDao.save(user);
    }

    // 4. Validate password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.auditService.recordIpFailedAttempt(ip);

      // Escenario 2: Lockout on 5 consecutive failures
      const result = await this.userDao.recordFailedAttempt(user, 5, 15);

      if (result.isLocked) {
        await this.auditService.logEvent({
          userId: user.id,
          email: user.email,
          action: "ACCOUNT_LOCKED",
          ipAddress: ip,
          userAgent,
          status: "BLOCKED",
          details: `Bloqueo temporal de 15 minutos aplicado tras alcanzar ${result.attempts} intentos fallidos`,
        });

        throw new UnauthorizedException(
          "Ha fallado 5 intentos de inicio de sesión consecutivos. Su cuenta ha sido bloqueada temporalmente por 15 minutos.",
        );
      } else {
        const remainingAttempts = 5 - result.attempts;
        await this.auditService.logEvent({
          userId: user.id,
          email: user.email,
          action: "LOGIN_FAILED",
          ipAddress: ip,
          userAgent,
          status: "FAILED",
          details: `Contraseña incorrecta. Intento fallido #${result.attempts}`,
        });

        throw new UnauthorizedException(
          `Credenciales inválidas. Le quedan ${remainingAttempts} intento(s) antes de que su cuenta sea bloqueada temporalmente.`,
        );
      }
    }

    // 5. Escenario 3: Check email verification
    if (!user.isEmailVerified) {
      await this.auditService.logEvent({
        userId: user.id,
        email: user.email,
        action: "LOGIN_FAILED_UNVERIFIED_EMAIL",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        details: "Intento de inicio de sesión con correo no verificado",
      });

      throw new UnauthorizedException(
        "El correo electrónico no ha sido verificado. Por favor verifique su correo antes de iniciar sesión.",
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ForbiddenException(
        "Su cuenta ha sido desactivada por el administrador.",
      );
    }

    // 6. Escenario 1: Login exitoso
    // Reset counters and unlock account
    await this.userDao.resetFailedAttempts(user.id);
    this.auditService.resetIpAttempts(ip);

    // Generate tokens: Access Token (15 min) and Refresh Token (7 days), invalidating previous Refresh Tokens
    const accessToken = this.tokenService.generateAccessToken(user);
    const { token: refreshToken } =
      await this.tokenService.createAndSaveRefreshToken(user);

    await this.auditService.logEvent({
      userId: user.id,
      email: user.email,
      action: "LOGIN_SUCCESS",
      ipAddress: ip,
      userAgent,
      status: "SUCCESS",
      details:
        "Inicio de sesión exitoso. Tokens emitidos y tokens previos invalidados.",
    });

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: 900, // 15 minutes
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  // Escenario 4: Renovación de sesión (POST /auth/refresh)
  async refreshToken(dto: RefreshTokenDto, ip: string, userAgent: string) {
    try {
      const { user, newAccessToken, newRefreshToken, expiresIn } =
        await this.tokenService.validateAndRotateRefreshToken(dto.refreshToken);

      await this.auditService.logEvent({
        userId: user.id,
        email: user.email,
        action: "TOKEN_REFRESH",
        ipAddress: ip,
        userAgent,
        status: "SUCCESS",
        details: "Renovación exitosa de sesión",
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: "Bearer",
        expiresIn,
      };
    } catch (error: any) {
      await this.auditService.logEvent({
        email: "unknown",
        action: "TOKEN_REFRESH_FAILED",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        details: error.message || "Error al renovar token",
      });

      throw new UnauthorizedException(
        "El token de actualización es inválido o ha expirado.",
      );
    }
  }

  // Task 2: Logout (POST /auth/logout)
  async logout(
    dto: RefreshTokenDto,
    ip: string,
    userAgent: string,
    userId?: string,
  ) {
    await this.tokenService.revokeRefreshToken(dto.refreshToken);

    await this.auditService.logEvent({
      userId: userId || null,
      email: "unknown",
      action: "LOGOUT",
      ipAddress: ip,
      userAgent,
      status: "SUCCESS",
      details: "Sesión cerrada. Refresh token revocado.",
    });

    return { message: "Sesión cerrada exitosamente" };
  }

  // Task 2: Forgot Password (POST /auth/forgot-password)
  async forgotPassword(dto: ForgotPasswordDto, ip: string, userAgent: string) {
    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.userDao.findByEmail(cleanEmail);

    let resetTokenValue: string | undefined;

    if (user) {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.passwordResetDao.create(user.id, token, expiresAt);
      resetTokenValue = token;

      await this.auditService.logEvent({
        userId: user.id,
        email: user.email,
        action: "FORGOT_PASSWORD_REQUEST",
        ipAddress: ip,
        userAgent,
        status: "SUCCESS",
        details: "Token de restablecimiento de contraseña generado",
      });
    }

    return {
      message:
        "Si el correo electrónico está registrado, recibirá las instrucciones para restablecer su contraseña.",
      ...(resetTokenValue ? { resetToken: resetTokenValue } : {}),
    };
  }

  // Task 2: Reset Password (POST /auth/reset-password)
  async resetPassword(dto: ResetPasswordDto, ip: string, userAgent: string) {
    const resetTokenRecord = await this.passwordResetDao.findByToken(dto.token);

    if (!resetTokenRecord || resetTokenRecord.isUsed) {
      throw new BadRequestException(
        "El token de recuperación es inválido o ya ha sido utilizado.",
      );
    }

    if (new Date() > resetTokenRecord.expiresAt) {
      throw new BadRequestException("El token de recuperación ha expirado.");
    }

    const user = resetTokenRecord.user;
    if (!user) {
      throw new NotFoundException("Usuario asociado al token no encontrado.");
    }

    // Hash new password and update user
    const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = newHashedPassword;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await this.userDao.save(user);

    // Mark reset token as used
    await this.passwordResetDao.markAsUsed(resetTokenRecord.id);

    // Security: Revoke all existing refresh tokens for this user
    await this.tokenService.revokeAllUserTokens(user.id);

    await this.auditService.logEvent({
      userId: user.id,
      email: user.email,
      action: "RESET_PASSWORD_SUCCESS",
      ipAddress: ip,
      userAgent,
      status: "SUCCESS",
      details: "Contraseña actualizada exitosamente. Tokens previos revocados.",
    });

    return {
      message: "Contraseña actualizada exitosamente. Por favor inicie sesión.",
    };
  }

  // Helper method for email verification (useful for testing & admin/user flows)
  async verifyEmail(email: string) {
    const user = await this.userDao.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    user.isEmailVerified = true;
    await this.userDao.save(user);

    return { message: "Correo electrónico verificado exitosamente" };
  }
}
