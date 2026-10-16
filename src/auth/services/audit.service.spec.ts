import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditService } from "./audit.service.js";
import { AuthAuditDao } from "../dao/auth-audit.dao.js";

describe("AuditService", () => {
  let service: AuditService;
  let daoMock: any;

  beforeEach(() => {
    daoMock = {
      log: vi.fn().mockResolvedValue({ id: "log-1" }),
      findByUserId: vi.fn(),
    };
    service = new AuditService(daoMock as unknown as AuthAuditDao);
  });

  it("should log access audit event with IP, UserAgent, timestamp and status (Task 4)", async () => {
    const payload = {
      userId: "user-123",
      email: "user@riwi.com",
      action: "LOGIN_SUCCESS",
      ipAddress: "192.168.1.50",
      userAgent: "Mozilla/5.0 Chrome",
      status: "SUCCESS",
      details: "Login ok",
    };

    await service.logEvent(payload);

    expect(daoMock.log).toHaveBeenCalledWith(payload);
  });

  it("should track failed attempts by IP and block IP after 10 consecutive failures (Task 3)", () => {
    const testIp = "200.50.10.2";

    // 9 failed attempts should not block IP
    for (let i = 0; i < 9; i++) {
      const res = service.recordIpFailedAttempt(testIp);
      expect(res.isBlocked).toBe(false);
      expect(service.isIpBlocked(testIp).isBlocked).toBe(false);
    }

    // 10th attempt blocks the IP
    const tenth = service.recordIpFailedAttempt(testIp);
    expect(tenth.isBlocked).toBe(true);
    expect(tenth.attempts).toBe(10);

    const check = service.isIpBlocked(testIp);
    expect(check.isBlocked).toBe(true);
    expect(check.remainingSeconds).toBeGreaterThan(0);
  });

  it("should reset IP attempts after successful login", () => {
    const testIp = "200.50.10.3";
    service.recordIpFailedAttempt(testIp);
    service.recordIpFailedAttempt(testIp);

    service.resetIpAttempts(testIp);

    expect(service.isIpBlocked(testIp).isBlocked).toBe(false);
  });
});
