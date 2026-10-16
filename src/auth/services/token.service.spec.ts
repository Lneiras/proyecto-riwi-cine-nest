import { describe, it, expect, vi, beforeEach } from "vitest";
import { TokenService } from "./token.service.js";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RefreshTokenDao } from "../dao/refresh-token.dao.js";
import { User } from "../entities/user.entity.js";

describe("TokenService", () => {
  let service: TokenService;
  let jwtServiceMock: any;
  let configServiceMock: any;
  let refreshTokenDaoMock: any;

  const mockUser: User = {
    id: "user-uuid-1234",
    email: "test@riwi.com",
    password: "hashed_password",
    name: "Test User",
    role: "client",
    isEmailVerified: true,
    failedLoginAttempts: 0,
    lockoutUntil: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jwtServiceMock = {
      sign: vi.fn().mockReturnValue("mocked.jwt.token"),
    };
    configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === "JWT_SECRET") return "test-secret";
        if (key === "JWT_EXPIRES_IN") return "15m";
        return null;
      }),
    };
    refreshTokenDaoMock = {
      create: vi.fn().mockResolvedValue({ id: "rt-1", token: "mock-rt" }),
      revokeAllUserTokens: vi.fn().mockResolvedValue(undefined),
      findByToken: vi.fn(),
      revokeToken: vi.fn().mockResolvedValue(undefined),
    };

    service = new TokenService(
      jwtServiceMock as unknown as JwtService,
      configServiceMock as unknown as ConfigService,
      refreshTokenDaoMock as unknown as RefreshTokenDao,
    );
  });

  it("should generate a signed JWT access token with 15 minutes expiration payload", () => {
    const token = service.generateAccessToken(mockUser);

    expect(token).toBe("mocked.jwt.token");
    expect(jwtServiceMock.sign).toHaveBeenCalledWith(
      {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      },
      {
        secret: "test-secret",
        expiresIn: "15m",
      },
    );
  });

  it("should create and save a new refresh token (7 days) and invalidate previous tokens (Criterion 1)", async () => {
    const result = await service.createAndSaveRefreshToken(mockUser);

    expect(refreshTokenDaoMock.revokeAllUserTokens).toHaveBeenCalledWith(
      mockUser.id,
    );
    expect(refreshTokenDaoMock.create).toHaveBeenCalledWith(
      mockUser.id,
      expect.any(String),
      expect.any(Date),
    );
    expect(result.token).toBeDefined();
    // Expiration must be approximately 7 days from now
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const diff = result.expiresAt.getTime() - Date.now();
    expect(diff).toBeGreaterThan(sevenDaysMs - 5000);
    expect(diff).toBeLessThanOrEqual(sevenDaysMs);
  });

  it("should validate and rotate refresh token issuing new access and refresh tokens (Criterion 4)", async () => {
    const activeToken = {
      token: "valid-rt",
      userId: mockUser.id,
      user: mockUser,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day in the future
      isRevoked: false,
    };
    refreshTokenDaoMock.findByToken.mockResolvedValue(activeToken);

    const rotation = await service.validateAndRotateRefreshToken("valid-rt");

    expect(refreshTokenDaoMock.revokeToken).toHaveBeenCalledWith(
      "valid-rt",
      expect.any(String),
    );
    expect(rotation.newAccessToken).toBe("mocked.jwt.token");
    expect(rotation.newRefreshToken).toBeDefined();
    expect(rotation.expiresIn).toBe(900);
  });

  it("should throw an error if the refresh token is revoked", async () => {
    refreshTokenDaoMock.findByToken.mockResolvedValue({
      token: "revoked-rt",
      isRevoked: true,
      expiresAt: new Date(Date.now() + 100000),
    });

    await expect(
      service.validateAndRotateRefreshToken("revoked-rt"),
    ).rejects.toThrow("INVALID_OR_REVOKED_TOKEN");
  });

  it("should throw an error and revoke if the refresh token is expired", async () => {
    refreshTokenDaoMock.findByToken.mockResolvedValue({
      token: "expired-rt",
      isRevoked: false,
      expiresAt: new Date(Date.now() - 1000), // In the past
    });

    await expect(
      service.validateAndRotateRefreshToken("expired-rt"),
    ).rejects.toThrow("EXPIRED_TOKEN");
    expect(refreshTokenDaoMock.revokeToken).toHaveBeenCalledWith("expired-rt");
  });
});
