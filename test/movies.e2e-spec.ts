import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MoviesController } from "../src/movie/controllers/movies.controller.js";
import { MoviesService } from "../src/movie/services/movies.service.js";
import { MoviesDao } from "../src/movie/dao/movies.dao.js";
import { AllExceptionsFilter } from "../src/common/filters/http-exception.filter.js";

// Verifica que las rutas de HU-003 (weekly/today/filter) y las de HU-004
// (:id, :id/recommendations) conviven bajo /movies sin pisarse.
describe("Movies API (e2e) — HU-003 + HU-004", () => {
  let app: INestApplication;
  let dao: {
    findBillboard: ReturnType<typeof vi.fn>;
    findByIdWithFunctions: ReturnType<typeof vi.fn>;
    findSimilar: ReturnType<typeof vi.fn>;
  };

  const detailMovie = (functions: unknown[] = []) => ({
    id: 1,
    title: "Dune: Parte Dos",
    genre: "Ciencia ficción",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    functions,
  });

  beforeEach(async () => {
    dao = {
      findBillboard: vi.fn().mockResolvedValue([[{ id: 7, title: "Cartelera" }], 1]),
      findByIdWithFunctions: vi.fn(),
      findSimilar: vi.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [MoviesService, { provide: MoviesDao, useValue: dao }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe("HU-003 routes keep working (declared first)", () => {
    it.each(["weekly", "today", "filter"])(
      "GET /movies/%s is handled by the billboard, not by :id",
      async (route) => {
        const res = await request(app.getHttpServer())
          .get(`/api/v1/movies/${route}?cityId=1`)
          .expect(200);

        expect(res.body).toEqual([{ id: 7, title: "Cartelera" }]);
        expect(res.headers["x-total-count"]).toBe("1");
        expect(dao.findByIdWithFunctions).not.toHaveBeenCalled();
      },
    );

    it("still validates cityId on weekly", async () => {
      await request(app.getHttpServer()).get("/api/v1/movies/weekly").expect(400);
    });
  });

  describe("GET /movies/:id (HU-004)", () => {
    it("returns the detail with embeddable trailer and price ranges", async () => {
      dao.findByIdWithFunctions.mockResolvedValue(
        detailMovie([
          {
            functionDate: "2999-01-01",
            showtime: { startTime: "19:00:00" },
            format: { name: "IMAX" },
            language: "SUBTITULADA",
            basePrice: 18000,
          },
        ]),
      );

      const res = await request(app.getHttpServer())
        .get("/api/v1/movies/1?cityId=1")
        .expect(200);

      expect(res.body).toMatchObject({
        id: 1,
        trailerEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        languages: ["SUBTITULADA"],
        formats: ["IMAX"],
        priceByFormat: [{ format: "IMAX", minPrice: 18000, maxPrice: 18000 }],
      });
      expect(dao.findByIdWithFunctions).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ cityId: 1 }),
      );
    });

    it("works without cityId", async () => {
      dao.findByIdWithFunctions.mockResolvedValue(detailMovie());
      await request(app.getHttpServer()).get("/api/v1/movies/1").expect(200);
    });

    it("returns 404 for an unknown movie", async () => {
      dao.findByIdWithFunctions.mockResolvedValue(null);
      const res = await request(app.getHttpServer()).get("/api/v1/movies/99").expect(404);
      expect(res.body.statusCode).toBe(404);
    });

    it.each([["abc"], ["1?cityId=0"], ["1?cityId=x"]])(
      "returns 400 for invalid input: %s",
      async (path) => {
        await request(app.getHttpServer()).get(`/api/v1/movies/${path}`).expect(400);
      },
    );
  });

  describe("GET /movies/:id/recommendations (HU-004)", () => {
    it("returns similar movies with the default limit", async () => {
      dao.findByIdWithFunctions.mockResolvedValue(detailMovie());
      dao.findSimilar.mockResolvedValue([{ id: 2, title: "Arrival" }]);

      const res = await request(app.getHttpServer())
        .get("/api/v1/movies/1/recommendations")
        .expect(200);

      expect(res.body).toEqual([{ id: 2, title: "Arrival" }]);
      expect(dao.findSimilar).toHaveBeenCalledWith("Ciencia ficción", 1, 6);
    });

    it("rejects a limit above 20", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/movies/1/recommendations?limit=50")
        .expect(400);
    });

    it("returns 404 for an unknown movie", async () => {
      dao.findByIdWithFunctions.mockResolvedValue(null);
      await request(app.getHttpServer())
        .get("/api/v1/movies/99/recommendations")
        .expect(404);
    });
  });
});
