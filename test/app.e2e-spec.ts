import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HealthController } from "../src/health/health.controller.js";
import { HealthService } from "../src/health/health.service.js";
import { DataSource } from "typeorm";
import { AllExceptionsFilter } from "../src/common/filters/http-exception.filter.js";

describe("Health API (e2e)", () => {
  let app: INestApplication;
  let dataSourceMock: {
    isInitialized: boolean;
    query: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    dataSourceMock = {
      isInitialized: true,
      query: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("GET /api/v1/health returns 200 with healthy database", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200);

    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("database");
    expect(response.body.database).toHaveProperty("status", "up");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("timestamp");
  });

  it("GET /api/v1/health returns 503 when database is down", async () => {
    dataSourceMock.query.mockRejectedValueOnce(new Error("Connection refused"));

    const response = await request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(503);

    expect(response.body).toHaveProperty("statusCode", 503);
    expect(response.body.message).toHaveProperty("status", "error");
    expect(response.body.message.database).toHaveProperty("status", "down");
  });
});
