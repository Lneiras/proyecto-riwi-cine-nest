import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserDao } from "../dao/user.dao.js";
import { JwtPayload } from "../services/token.service.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userDao: UserDao,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>("JWT_SECRET") ||
        "default_jwt_secret_riwi_cine_2026_super_secure",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userDao.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Usuario no autorizado o inactivo");
    }
    return user;
  }
}
