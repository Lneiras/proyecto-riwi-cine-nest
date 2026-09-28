import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity.js";
import { RefreshToken } from "./entities/refresh-token.entity.js";
import { PasswordResetToken } from "./entities/password-reset-token.entity.js";
import { AuthAuditLog } from "./entities/auth-audit-log.entity.js";
import { UserDao } from "./dao/user.dao.js";
import { RefreshTokenDao } from "./dao/refresh-token.dao.js";
import { PasswordResetDao } from "./dao/password-reset.dao.js";
import { AuthAuditDao } from "./dao/auth-audit.dao.js";
import { TokenService } from "./services/token.service.js";
import { AuditService } from "./services/audit.service.js";
import { AuthService } from "./services/auth.service.js";
import { AuthController } from "./controllers/auth.controller.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      PasswordResetToken,
      AuthAuditLog,
    ]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>("JWT_SECRET") ||
          "default_jwt_secret_riwi_cine_2026_super_secure",
        signOptions: {
          expiresIn: (configService.get<string>("JWT_EXPIRES_IN") ||
            "15m") as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserDao,
    RefreshTokenDao,
    PasswordResetDao,
    AuthAuditDao,
    TokenService,
    AuditService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    TokenService,
    AuditService,
    JwtAuthGuard,
    UserDao,
    TypeOrmModule,
  ],
})
export class AuthModule {}
