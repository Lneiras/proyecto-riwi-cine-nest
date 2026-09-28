import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PasswordResetToken } from "../entities/password-reset-token.entity.js";

@Injectable()
export class PasswordResetDao {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly repository: Repository<PasswordResetToken>,
  ) {}

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<PasswordResetToken> {
    // Invalidate any previous unused reset tokens for this user
    await this.repository.update({ userId, isUsed: false }, { isUsed: true });

    const resetToken = this.repository.create({
      userId,
      token,
      expiresAt,
      isUsed: false,
    });
    return this.repository.save(resetToken);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return this.repository.findOne({
      where: { token },
      relations: { user: true },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repository.update(id, { isUsed: true });
  }
}
