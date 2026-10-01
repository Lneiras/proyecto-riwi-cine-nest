import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RefreshToken } from "../entities/refresh-token.entity.js";

@Injectable()
export class RefreshTokenDao {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = this.repository.create({
      userId,
      token,
      expiresAt,
      isRevoked: false,
    });
    return this.repository.save(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.repository.findOne({
      where: { token },
      relations: { user: true },
    });
  }

  async revokeToken(token: string, replacedByToken?: string): Promise<void> {
    await this.repository.update(
      { token },
      {
        isRevoked: true,
        ...(replacedByToken ? { replacedByToken } : {}),
      },
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.repository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    return this.repository.find({
      where: { userId, isRevoked: false },
    });
  }
}
