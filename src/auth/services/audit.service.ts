import { Injectable, Logger } from "@nestjs/common";
import { AuthAuditDao, CreateAuditLogDto } from "../dao/auth-audit.dao.js";

interface IpTracker {
  attempts: number;
  blockedUntil?: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly ipAttempts = new Map<string, IpTracker>();

  constructor(private readonly authAuditDao: AuthAuditDao) {}

  async logEvent(data: CreateAuditLogDto) {
    try {
      return await this.authAuditDao.log(data);
    } catch (error) {
      this.logger.error(
        `Error saving audit log: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  isIpBlocked(ip: string): { isBlocked: boolean; remainingSeconds?: number } {
    const cleanIp = ip.trim();
    const tracker = this.ipAttempts.get(cleanIp);

    if (!tracker || !tracker.blockedUntil) {
      return { isBlocked: false };
    }

    const now = Date.now();
    const remainingMs = tracker.blockedUntil.getTime() - now;

    if (remainingMs > 0) {
      return {
        isBlocked: true,
        remainingSeconds: Math.ceil(remainingMs / 1000),
      };
    }

    // Lockout expired, reset IP tracker
    this.ipAttempts.delete(cleanIp);
    return { isBlocked: false };
  }

  recordIpFailedAttempt(
    ip: string,
    maxAttempts: number = 10,
    lockoutMinutes: number = 15,
  ): { isBlocked: boolean; attempts: number } {
    const cleanIp = ip.trim();
    const tracker = this.ipAttempts.get(cleanIp) || { attempts: 0 };
    tracker.attempts += 1;

    let isBlocked = false;
    if (tracker.attempts >= maxAttempts) {
      tracker.blockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      isBlocked = true;
      this.logger.warn(
        `IP ${cleanIp} has been temporarily blocked for ${lockoutMinutes} minutes`,
      );
    }

    this.ipAttempts.set(cleanIp, tracker);
    return { isBlocked, attempts: tracker.attempts };
  }

  resetIpAttempts(ip: string) {
    this.ipAttempts.delete(ip.trim());
  }

  async getUserAuditLogs(userId: string) {
    return this.authAuditDao.findByUserId(userId);
  }
}
