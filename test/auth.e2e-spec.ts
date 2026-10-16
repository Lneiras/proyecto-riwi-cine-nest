import { Test, TestingModule } from "@nestjs/testing";
import {
  HttpException,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import request from "supertest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "../src/auth/controllers/auth.controller.js";
import { AuthService } from "../src/auth/services/auth.service.js";
import { AuditService } from "../src/auth/services/audit.service.js";
import { AllExceptionsFilter } from "../src/common/filters/http-exception.filter.js";

describe("Auth API (e2e - HU-007)", () => {
  let app: INestApplication;
  let authServiceMock: any;
  let auditServiceMock: any;

  beforeEach(async () => {
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

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: AuditService,
          useValue: auditServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("Escenario 1: POST /api/v1/auth/login exitoso retorna 200 con Access Token (15 min) y Refresh Token (7 días)", async () => {
    authServiceMock.login.mockResolvedValueOnce({
      accessToken: "mocked.jwt.access.token",
      refreshToken: "mocked.refresh.token",
      tokenType: "Bearer",
      expiresIn: 900,
      user: {
        id: "user-uuid-1",
        email: "cinefilo@riwi.com",
        name: "Cinéfilo",
        role: "client",
        isEmailVerified: true,
      },
    });

    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: "cinefilo@riwi.com",
        password: "Password123*",
      })
      .expect(200);

    expect(response.body).toHaveProperty(
      "accessToken",
      "mocked.jwt.access.token",
    );
    expect(response.body).toHaveProperty(
      "refreshToken",
      "mocked.refresh.token",
    );
    expect(response.body).toHaveProperty("tokenType", "Bearer");
    expect(response.body).toHaveProperty("expiresIn", 900);
    expect(response.body.user).toHaveProperty("isEmailVerified", true);
  });

  it("Escenario 2: POST /api/v1/auth/login rechaza con 429 cuando la cuenta está bloqueada temporalmente", async () => {
    authServiceMock.login.mockRejectedValueOnce(
      new HttpException(
        "La cuenta se encuentra bloqueada temporalmente por 15 minutos debido a múltiples intentos fallidos. Intente de nuevo en 15 minuto(s).",
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );

    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: "locked@riwi.com",
        password: "Password123*",
      })
      .expect(429);

    expect(response.body.message).toContain(
      "bloqueada temporalmente por 15 minutos",
    );
  });

  it("Escenario 3: POST /api/v1/auth/login rechaza con 401 si el correo no está verificado", async () => {
    authServiceMock.login.mockRejectedValueOnce(
      new UnauthorizedException(
        "El correo electrónico no ha sido verificado. Por favor verifique su correo antes de iniciar sesión.",
      ),
    );

    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: "unverified@riwi.com",
        password: "Password123*",
      })
      .expect(401);

    expect(response.body.message).toContain(
      "El correo electrónico no ha sido verificado",
    );
  });

  it("Escenario 4: POST /api/v1/auth/refresh emite nuevo Access Token con Refresh Token válido", async () => {
    authServiceMock.refreshToken.mockResolvedValueOnce({
      accessToken: "renewed.jwt.access.token",
      refreshToken: "renewed.refresh.token",
      tokenType: "Bearer",
      expiresIn: 900,
    });

    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .send({
        refreshToken: "valid.old.refresh.token",
      })
      .expect(200);

    expect(response.body).toHaveProperty(
      "accessToken",
      "renewed.jwt.access.token",
    );
    expect(response.body).toHaveProperty(
      "refreshToken",
      "renewed.refresh.token",
    );
  });

  it("Task 2: POST /api/v1/auth/logout revoca sesión y retorna 200", async () => {
    authServiceMock.logout.mockResolvedValueOnce({
      message: "Sesión cerrada exitosamente",
    });

    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .send({
        refreshToken: "token.to.revoke",
      })
      .expect(200);

    expect(response.body.message).toBe("Sesión cerrada exitosamente");
  });

  it("Task 2: POST /api/v1/auth/forgot-password y POST /api/v1/auth/reset-password", async () => {
    authServiceMock.forgotPassword.mockResolvedValueOnce({
      message: "Instrucciones enviadas",
    });
    authServiceMock.resetPassword.mockResolvedValueOnce({
      message: "Contraseña actualizada exitosamente. Por favor inicie sesión.",
    });

    await request(app.getHttpServer())
      .post("/api/v1/auth/forgot-password")
      .send({ email: "user@riwi.com" })
      .expect(200);

    await request(app.getHttpServer())
      .post("/api/v1/auth/reset-password")
      .send({
        token: "valid-reset-token",
        newPassword: "NewPassword123*",
      })
      .expect(200);
  });
});
