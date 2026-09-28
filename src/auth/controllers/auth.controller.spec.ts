import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { AuditService } from "../services/audit.service.js";

describe("AuthController", () => {
  let controller: AuthController;
  let authServiceMock: any;
  let auditServiceMock: any;

  const mockReq: any = {
    headers: {
      "user-agent": "Vitest Test Runner",
      "x-forwarded-for": "10.0.0.1",
    },
    ip: "10.0.0.1",
  };

  beforeEach(() => {
    authServiceMock = {
      register: vi.fn(),
      login: vi.fn(),
      refreshToken: vi.fn(),
      logout: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
    };

    auditServiceMock = {
      getUserAuditLogs: vi.fn(),
    };

    controller = new AuthController(
      authServiceMock as unknown as AuthService,
      auditServiceMock as unknown as AuditService,
    );
  });

  it("should call authService.login on POST /auth/login", async () => {
    authServiceMock.login.mockResolvedValue({
      accessToken: "mock.access.token",
      refreshToken: "mock.refresh.token",
      tokenType: "Bearer",
      expiresIn: 900,
    });

    const dto = { email: "user@riwi.com", password: "Password123*" };
    const result = await controller.login(dto, mockReq);

    expect(authServiceMock.login).toHaveBeenCalledWith(
      dto,
      "10.0.0.1",
      "Vitest Test Runner",
    );
    expect(result.accessToken).toBe("mock.access.token");
  });

  it("should call authService.refreshToken on POST /auth/refresh", async () => {
    authServiceMock.refreshToken.mockResolvedValue({
      accessToken: "new.access.token",
      refreshToken: "new.refresh.token",
      tokenType: "Bearer",
      expiresIn: 900,
    });

    const dto = { refreshToken: "existing.refresh.token" };
    const result = await controller.refresh(dto, mockReq);

    expect(authServiceMock.refreshToken).toHaveBeenCalledWith(
      dto,
      "10.0.0.1",
      "Vitest Test Runner",
    );
    expect(result.accessToken).toBe("new.access.token");
  });

  it("should call authService.logout on POST /auth/logout", async () => {
    authServiceMock.logout.mockResolvedValue({
      message: "Sesión cerrada exitosamente",
    });

    const dto = { refreshToken: "token-to-revoke" };
    const result = await controller.logout(dto, mockReq);

    expect(authServiceMock.logout).toHaveBeenCalledWith(
      dto,
      "10.0.0.1",
      "Vitest Test Runner",
    );
    expect(result.message).toBe("Sesión cerrada exitosamente");
  });

  it("should call authService.forgotPassword on POST /auth/forgot-password", async () => {
    authServiceMock.forgotPassword.mockResolvedValue({
      message: "Instrucciones enviadas",
    });

    const dto = { email: "user@riwi.com" };
    const result = await controller.forgotPassword(dto, mockReq);

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(
      dto,
      "10.0.0.1",
      "Vitest Test Runner",
    );
    expect(result.message).toBe("Instrucciones enviadas");
  });

  it("should call authService.resetPassword on POST /auth/reset-password", async () => {
    authServiceMock.resetPassword.mockResolvedValue({
      message: "Contraseña actualizada exitosamente",
    });

    const dto = { token: "token-abc", newPassword: "NewPassword123*" };
    const result = await controller.resetPassword(dto, mockReq);

    expect(authServiceMock.resetPassword).toHaveBeenCalledWith(
      dto,
      "10.0.0.1",
      "Vitest Test Runner",
    );
    expect(result.message).toBe("Contraseña actualizada exitosamente");
  });

  it("should call auditService.getUserAuditLogs on GET /auth/audit", async () => {
    const logs = [{ id: "log-1", action: "LOGIN_SUCCESS" }];
    auditServiceMock.getUserAuditLogs.mockResolvedValue(logs);

    const reqWithUser = { user: { id: "user-123" } };
    const result = await controller.getAuditLogs(reqWithUser);

    expect(auditServiceMock.getUserAuditLogs).toHaveBeenCalledWith("user-123");
    expect(result).toEqual(logs);
  });
});
