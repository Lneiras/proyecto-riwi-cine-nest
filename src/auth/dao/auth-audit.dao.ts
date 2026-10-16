import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthAuditLog } from "../entities/auth-audit-log.entity.js";

export interface CreateAuditLogDto {
  userId?: string | null;
  email: string;
  action: string;
  ipAddress: string;
  userAgent?: string | null;
  status: string;
  details?: string | null;
}

@Injectable()
export class AuthAuditDao {
  constructor(
    @InjectRepository(AuthAuditLog)
    private readonly repository: Repository<AuthAuditLog>,
  ) {}

  async log(data: CreateAuditLogDto): Promise<AuthAuditLog> {
    const logEntry = this.repository.create({
      userId: data.userId || null,
      email: data.email,
      action: data.action,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent || "Unknown",
      status: data.status,
      details: data.details || null,
    });
    return this.repository.save(logEntry);
  }

  async findByUserId(
    userId: string,
    limit: number = 20,
  ): Promise<AuthAuditLog[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async findRecentByEmail(
    email: string,
    limit: number = 10,
  ): Promise<AuthAuditLog[]> {
    return this.repository.find({
      where: { email },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }
}
