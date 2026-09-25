import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthService } from "./health.service.js";
import { ServiceUnavailableException } from "@nestjs/common";
import { DataSource } from "typeorm";

describe("HealthService", () => {
  let service: HealthService;
  let dataSourceMock: {
    isInitialized: boolean;
    query: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    dataSourceMock = {
      isInitialized: true,
      query: vi.fn(),
    };
    service = new HealthService(dataSourceMock as unknown as DataSource);
  });

  it("should return ok status when database query succeeds", async () => {
    dataSourceMock.query.mockResolvedValueOnce([{ "?column?": 1 }]);

    const result = await service.check();

    expect(result.status).toBe("ok");
    expect(result.database.status).toBe("up");
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeDefined();
    expect(dataSourceMock.query).toHaveBeenCalledWith("SELECT 1");
  });

  it("should throw ServiceUnavailableException when database is not initialized", async () => {
    dataSourceMock.isInitialized = false;

    await expect(service.check()).rejects.toThrow(ServiceUnavailableException);
  });

  it("should throw ServiceUnavailableException when database query fails", async () => {
    dataSourceMock.query.mockRejectedValueOnce(
      new Error("Connection refused"),
    );

    await expect(service.check()).rejects.toThrow(ServiceUnavailableException);
  });
});
