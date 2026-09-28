import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "node:crypto";
import { RefreshTokenDao } from "../dao/refresh-token.dao.js";
import { User } from "../entities/user.entity.js";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenDao: RefreshTokenDao,
  ) {}

  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const expiresIn = this.configService.get<string>("JWT_EXPIRES_IN") || "15m";
    const secret =
      this.configService.get<string>("JWT_SECRET") ||
      "default_jwt_secret_riwi_cine_2026_super_secure";

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresIn as any,
    });
  }

  generateRefreshTokenString(): string {
    return randomBytes(64).toString("hex");
  }

  async createAndSaveRefreshToken(
    user: User,
  ): Promise<{ token: string; expiresAt: Date }> {
    // 1. Invalidate previous active refresh token(s) of this user (Criterion 1)
    await this.refreshTokenDao.revokeAllUserTokens(user.id);

    // 2. Generate new refresh token with 7 days expiration
    const token = this.generateRefreshTokenString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.refreshTokenDao.create(user.id, token, expiresAt);

    return { token, expiresAt };
  }

  async validateAndRotateRefreshToken(rawToken: string): Promise<{
    user: User;
    newAccessToken: string;
    newRefreshToken: string;
    expiresIn: number;
  }> {
    const storedToken = await this.refreshTokenDao.findByToken(rawToken);

    if (!storedToken || storedToken.isRevoked) {
      throw new Error("INVALID_OR_REVOKED_TOKEN");
    }

    if (new Date() > storedToken.expiresAt) {
      // Mark as revoked/expired
      await this.refreshTokenDao.revokeToken(storedToken.token);
      throw new Error("EXPIRED_TOKEN");
    }

    const user = storedToken.user;
    if (!user || !user.isActive) {
      throw new Error("USER_NOT_ACTIVE");
    }

    // Invalidate old token and replace with new rotated token
    const newRefreshTokenString = this.generateRefreshTokenString();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenDao.revokeToken(
      storedToken.token,
      newRefreshTokenString,
    );
    await this.refreshTokenDao.create(
      user.id,
      newRefreshTokenString,
      newExpiresAt,
    );

    const newAccessToken = this.generateAccessToken(user);

    return {
      user,
      newAccessToken,
      newRefreshToken: newRefreshTokenString,
      expiresIn: 900, // 15 min = 900 seconds
    };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenDao.revokeToken(token);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenDao.revokeAllUserTokens(userId);
  }
}
