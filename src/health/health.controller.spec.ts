import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

describe("HealthController", () => {
  let controller: HealthController;
  let healthServiceMock: Partial<HealthService>;

  beforeEach(() => {
    healthServiceMock = {
      check: vi.fn(),
    };
    controller = new HealthController(healthServiceMock as HealthService);
  });

  it("should return health check result", async () => {
    const expected = {
      status: "ok" as const,
      timestamp: "2026-09-25T01:00:00.000Z",
      uptime: 10,
      database: {
        status: "up" as const,
      },
    };
    (healthServiceMock.check as any).mockResolvedValueOnce(expected);

    const result = await controller.check();

    expect(result).toEqual(expected);
    expect(healthServiceMock.check).toHaveBeenCalled();
  });
});
