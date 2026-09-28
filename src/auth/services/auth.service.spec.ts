import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth.service.js";
import { UserDao } from "../dao/user.dao.js";
import { PasswordResetDao } from "../dao/password-reset.dao.js";
import { TokenService } from "./token.service.js";
import { AuditService } from "./audit.service.js";
import {
  BadRequestException,
  HttpException,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { User } from "../entities/user.entity.js";

describe("AuthService (HU-007)", () => {
  let authService: AuthService;
  let userDaoMock: any;
  let passwordResetDaoMock: any;
  let tokenServiceMock: any;
  let auditServiceMock: any;

  const validPassword = "PlainPassword123*";
  let hashedPassword: string;

  beforeEach(async () => {
    hashedPassword = await bcrypt.hash(validPassword, 10);

    userDaoMock = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      recordFailedAttempt: vi.fn(),
      resetFailedAttempts: vi.fn(),
    };

    passwordResetDaoMock = {
      create: vi.fn(),
      findByToken: vi.fn(),
      markAsUsed: vi.fn(),
    };

    tokenServiceMock = {
      generateAccessToken: vi.fn().mockReturnValue("jwt.access.token.15m"),
      createAndSaveRefreshToken: vi.fn().mockResolvedValue({
        token: "refresh.token.7d",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
      validateAndRotateRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
      revokeAllUserTokens: vi.fn().mockResolvedValue(undefined),
    };

    auditServiceMock = {
      logEvent: vi.fn().mockResolvedValue(undefined),
      isIpBlocked: vi.fn().mockReturnValue({ isBlocked: false }),
      recordIpFailedAttempt: vi.fn(),
      resetIpAttempts: vi.fn(),
    };

    authService = new AuthService(
      userDaoMock as unknown as UserDao,
      passwordResetDaoMock as unknown as PasswordResetDao,
      tokenServiceMock as unknown as TokenService,
      auditServiceMock as unknown as AuditService,
    );
  });

  describe("Escenario 1: Login exitoso", () => {
    it("debe emitir Access Token (15 min), Refresh Token (7 días) e invalidar el Refresh Token anterior cuando las credenciales son correctas y el correo está verificado", async () => {
      const mockUser: User = {
        id: "user-1",
        email: "verified@riwi.com",
        password: hashedPassword,
        name: "Usuario Verificado",
        role: "client",
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockoutUntil: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userDaoMock.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login(
        { email: "verified@riwi.com", password: validPassword },
        "127.0.0.1",
        "Vitest Browser",
      );

      expect(result.accessToken).toBe("jwt.access.token.15m");
      expect(result.refreshToken).toBe("refresh.token.7d");
      expect(result.tokenType).toBe("Bearer");
      expect(result.expiresIn).toBe(900);
      expect(result.user.email).toBe("verified@riwi.com");

      // Reset de intentos e invalidación de tokens previos
      expect(userDaoMock.resetFailedAttempts).toHaveBeenCalledWith("user-1");
      expect(auditServiceMock.resetIpAttempts).toHaveBeenCalledWith(
        "127.0.0.1",
      );
      expect(tokenServiceMock.createAndSaveRefreshToken).toHaveBeenCalledWith(
        mockUser,
      );
      expect(auditServiceMock.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "LOGIN_SUCCESS",
          status: "SUCCESS",
        }),
      );
    });
  });

  describe("Escenario 2: Error — bloqueo por intentos fallidos", () => {
    it("debe incrementar intentos fallidos y advertir intentos restantes si la contraseña es incorrecta", async () => {
      const mockUser: User = {
        id: "user-2",
        email: "user@riwi.com",
        password: hashedPassword,
        name: "Test User",
        role: "client",
        isEmailVerified: true,
        failedLoginAttempts: 2,
        lockoutUntil: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userDaoMock.findByEmail.mockResolvedValue(mockUser);
      userDaoMock.recordFailedAttempt.mockResolvedValue({
        isLocked: false,
        attempts: 3,
        lockoutUntil: null,
      });

      await expect(
        authService.login(
          { email: "user@riwi.com", password: "wrong-password" },
          "127.0.0.1",
          "Test Agent",
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(userDaoMock.recordFailedAttempt).toHaveBeenCalledWith(
        mockUser,
        5,
        15,
      );
      expect(auditServiceMock.recordIpFailedAttempt).toHaveBeenCalledWith(
        "127.0.0.1",
      );
    });

    it("debe bloquear la cuenta por 15 minutos e informar al usuario al alcanzar 5 intentos fallidos consecutivos", async () => {
      const mockUser: User = {
        id: "user-2",
        email: "user@riwi.com",
        password: hashedPassword,
        name: "Test User",
        role: "client",
        isEmailVerified: true,
        failedLoginAttempts: 4,
        lockoutUntil: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const lockoutTime = new Date(Date.now() + 15 * 60 * 1000);
      userDaoMock.findByEmail.mockResolvedValue(mockUser);
      userDaoMock.recordFailedAttempt.mockResolvedValue({
        isLocked: true,
        attempts: 5,
        lockoutUntil: lockoutTime,
      });

      await expect(
        authService.login(
          { email: "user@riwi.com", password: "wrong-password" },
          "127.0.0.1",
          "Test Agent",
        ),
      ).rejects.toThrow(
        /Ha fallado 5 intentos de inicio de sesión consecutivos. Su cuenta ha sido bloqueada temporalmente por 15 minutos./,
      );

      expect(auditServiceMock.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "ACCOUNT_LOCKED",
          status: "BLOCKED",
        }),
      );
    });

    it("cuando un usuario intenta un sexto intento mientras la cuenta está bloqueada, debe rechazar inmediatamente informando el bloqueo temporal", async () => {
      const lockedUntil = new Date(Date.now() + 14 * 60 * 1000); // 14 min remaining
      const lockedUser: User = {
        id: "user-3",
        email: "locked@riwi.com",
        password: hashedPassword,
        name: "Locked User",
        role: "client",
        isEmailVerified: true,
        failedLoginAttempts: 5,
        lockoutUntil: lockedUntil,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userDaoMock.findByEmail.mockResolvedValue(lockedUser);

      try {
        await authService.login(
          { email: "locked@riwi.com", password: validPassword },
          "127.0.0.1",
          "Test Agent",
        );
        expect.fail("Should have thrown an HttpException");
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(429);
        expect(error.message).toContain(
          "La cuenta se encuentra bloqueada temporalmente por 15 minutos",
        );
      }
    });
  });

  describe("Escenario 3: Error — correo no verificado", () => {
    it("debe rechazar el login e indicar que debe verificar su correo primero cuando ingresa credenciales correctas pero el correo no está verificado", async () => {
      const unverifiedUser: User = {
        id: "user-4",
        email: "unverified@riwi.com",
        password: hashedPassword,
        name: "Unverified User",
        role: "client",
        isEmailVerified: false, // NOT verified
        failedLoginAttempts: 0,
        lockoutUntil: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userDaoMock.findByEmail.mockResolvedValue(unverifiedUser);

      await expect(
        authService.login(
          { email: "unverified@riwi.com", password: validPassword },
          "127.0.0.1",
          "Test Agent",
        ),
      ).rejects.toThrow(
        /El correo electrónico no ha sido verificado. Por favor verifique su correo antes de iniciar sesión./,
      );

      expect(auditServiceMock.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "LOGIN_FAILED_UNVERIFIED_EMAIL",
          status: "FAILED",
        }),
      );
    });
  });

  describe("Escenario 4: Renovación de sesión (POST /auth/refresh)", () => {
    it("debe emitir un nuevo Access Token sin requerir nueva autenticación manual cuando el Refresh Token es válido", async () => {
      tokenServiceMock.validateAndRotateRefreshToken.mockResolvedValue({
        user: { id: "user-5" },
        newAccessToken: "new.jwt.access.token",
        newRefreshToken: "new.rotated.refresh.token",
        expiresIn: 900,
      });

      const response = await authService.refreshToken(
        { refreshToken: "valid.old.refresh.token" },
        "127.0.0.1",
        "Test Agent",
      );

      expect(response.accessToken).toBe("new.jwt.access.token");
      expect(response.refreshToken).toBe("new.rotated.refresh.token");
      expect(response.tokenType).toBe("Bearer");
      expect(response.expiresIn).toBe(900);
      expect(auditServiceMock.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "TOKEN_REFRESH",
          status: "SUCCESS",
        }),
      );
    });

    it("debe rechazar con 401 Unauthorized si el Refresh Token es inválido o expirado", async () => {
      tokenServiceMock.validateAndRotateRefreshToken.mockRejectedValue(
        new Error("EXPIRED_TOKEN"),
      );

      await expect(
        authService.refreshToken(
          { refreshToken: "expired.token" },
          "127.0.0.1",
          "Test Agent",
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("Task 2: Logout, Forgot-Password y Reset-Password", () => {
    it("logout debe revocar el refresh token y registrar auditoría", async () => {
      const result = await authService.logout(
        { refreshToken: "token-to-revoke" },
        "127.0.0.1",
        "Chrome",
      );

      expect(tokenServiceMock.revokeRefreshToken).toHaveBeenCalledWith(
        "token-to-revoke",
      );
      expect(result.message).toBe("Sesión cerrada exitosamente");
      expect(auditServiceMock.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ action: "LOGOUT", status: "SUCCESS" }),
      );
    });

    it("forgot-password debe generar token de restablecimiento si el usuario existe", async () => {
      const user: User = {
        id: "user-fp",
        email: "forgot@riwi.com",
        password: hashedPassword,
        name: "Forgot User",
        role: "client",
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockoutUntil: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userDaoMock.findByEmail.mockResolvedValue(user);

      const result = await authService.forgotPassword(
        { email: "forgot@riwi.com" },
        "127.0.0.1",
        "Chrome",
      );

      expect(passwordResetDaoMock.create).toHaveBeenCalledWith(
        user.id,
        expect.any(String),
        expect.any(Date),
      );
      expect(result.resetToken).toBeDefined();
    });

    it("reset-password debe actualizar la contraseña, desbloquear cuenta y revocar sesiones activas", async () => {
      const user: User = {
        id: "user-rp",
        email: "reset@riwi.com",
        password: hashedPassword,
        name: "Reset User",
        role: "client",
        isEmailVerified: true,
        failedLoginAttempts: 5,
        lockoutUntil: new Date(Date.now() + 100000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const resetTokenRecord = {
        id: "token-id-1",
        token: "valid-reset-token",
        user,
        isUsed: false,
        expiresAt: new Date(Date.now() + 600000), // In 10 min
      };

      passwordResetDaoMock.findByToken.mockResolvedValue(resetTokenRecord);

      const response = await authService.resetPassword(
        { token: "valid-reset-token", newPassword: "NewSecretPassword2026*" },
        "127.0.0.1",
        "Chrome",
      );

      expect(userDaoMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          failedLoginAttempts: 0,
          lockoutUntil: null,
        }),
      );
      expect(passwordResetDaoMock.markAsUsed).toHaveBeenCalledWith(
        "token-id-1",
      );
      expect(tokenServiceMock.revokeAllUserTokens).toHaveBeenCalledWith(
        user.id,
      );
      expect(response.message).toContain("Contraseña actualizada exitosamente");
    });

    it("reset-password debe rechazar si el token es inválido o expirado", async () => {
      passwordResetDaoMock.findByToken.mockResolvedValue(null);

      await expect(
        authService.resetPassword(
          { token: "invalid-token", newPassword: "password123" },
          "127.0.0.1",
          "Chrome",
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Task 3: Bloqueo por IP", () => {
    it("debe rechazar la petición con 429 Too Many Requests si la IP del cliente está bloqueada", async () => {
      auditServiceMock.isIpBlocked.mockReturnValue({
        isBlocked: true,
        remainingSeconds: 600,
      });

      await expect(
        authService.login(
          { email: "any@riwi.com", password: "password" },
          "192.168.1.99",
          "Attacker Bot",
        ),
      ).rejects.toThrow(HttpException);

      expect(auditServiceMock.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "LOGIN_BLOCKED_IP",
          status: "BLOCKED",
        }),
      );
    });
  });
});
