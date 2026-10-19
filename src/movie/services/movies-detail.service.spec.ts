// Pruebas de HU-004 (detalle y recomendaciones). Van en un archivo aparte
// para no tocar movies.service.spec.ts de HU-003. Corren con Vitest.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { MoviesService } from "./movies.service.js";
import { MoviesDao } from "../dao/movies.dao.js";
import { Movie } from "../entities/movie.entity.js";

const fn = (
  date: string,
  time: string,
  format: string,
  language: string,
  basePrice: number,
) => ({
  functionDate: date,
  showtime: { startTime: time },
  format: { name: format },
  language,
  basePrice,
});

const movie = (functions: ReturnType<typeof fn>[] = []) =>
  ({
    id: 1,
    title: "Dune: Parte Dos",
    genre: "Ciencia ficción",
    trailerUrl: "https://youtu.be/dQw4w9WgXcQ",
    functions,
  }) as unknown as Movie;

describe("MoviesService — HU-004", () => {
  let service: MoviesService;
  let daoMock: {
    findByIdWithFunctions: ReturnType<typeof vi.fn>;
    findSimilar: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // 15 oct 2026, 10:00 a. m. en Colombia (15:00 UTC).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T15:00:00Z"));
    daoMock = { findByIdWithFunctions: vi.fn(), findSimilar: vi.fn() };
    service = new MoviesService(daoMock as unknown as MoviesDao);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("findDetail", () => {
    it("asks the DAO from today onward, scoped to the city", async () => {
      daoMock.findByIdWithFunctions.mockResolvedValue(movie());

      await service.findDetail(1, 5);

      expect(daoMock.findByIdWithFunctions).toHaveBeenCalledWith(1, {
        cityId: 5,
        dateFrom: "2026-10-15",
      });
    });

    it("builds embed trailer, languages, formats and price range per format", async () => {
      daoMock.findByIdWithFunctions.mockResolvedValue(
        movie([
          fn("2026-10-15", "19:00:00", "IMAX", "SUBTITULADA", 20000),
          fn("2026-10-16", "14:00:00", "2D", "SUBTITULADA", 14000),
          fn("2026-10-17", "16:00:00", "2D", "DOBLADA", 16000),
        ]),
      );

      const result = await service.findDetail(1);

      expect(result.trailerEmbedUrl).toBe(
        "https://www.youtube.com/embed/dQw4w9WgXcQ",
      );
      expect(result.languages).toEqual(["DOBLADA", "SUBTITULADA"]);
      expect(result.formats).toEqual(["2D", "IMAX"]);
      expect(result.priceByFormat).toEqual([
        { format: "2D", minPrice: 14000, maxPrice: 16000 },
        { format: "IMAX", minPrice: 20000, maxPrice: 20000 },
      ]);
      expect(result.functions).toHaveLength(3);
    });

    it("drops today's functions whose showtime already passed (RN-014)", async () => {
      daoMock.findByIdWithFunctions.mockResolvedValue(
        movie([
          fn("2026-10-15", "09:30:00", "2D", "DOBLADA", 10000), // ya pasó
          fn("2026-10-15", "10:00:00", "2D", "DOBLADA", 11000), // empieza ahora
          fn("2026-10-15", "10:01:00", "3D", "DOBLADA", 12000), // futura
        ]),
      );

      const result = await service.findDetail(1);

      expect(result.functions.map((f) => f.showtime.startTime)).toEqual([
        "10:01:00",
      ]);
      expect(result.formats).toEqual(["3D"]);
    });

    it("uses the Colombia clock, not UTC, to decide what already started", async () => {
      // 16 oct 02:00 UTC = 15 oct 9:00 p. m. en Colombia.
      vi.setSystemTime(new Date("2026-10-16T02:00:00Z"));
      daoMock.findByIdWithFunctions.mockResolvedValue(
        movie([
          fn("2026-10-15", "19:00:00", "2D", "DOBLADA", 10000), // ya pasó
          fn("2026-10-15", "21:30:00", "2D", "DOBLADA", 10000), // falta 30 min
        ]),
      );

      const result = await service.findDetail(1);

      expect(result.functions.map((f) => f.showtime.startTime)).toEqual([
        "21:30:00",
      ]);
    });

    it("returns empty summaries when there are no upcoming functions", async () => {
      daoMock.findByIdWithFunctions.mockResolvedValue(movie());

      const result = await service.findDetail(1);

      expect(result.functions).toEqual([]);
      expect(result.languages).toEqual([]);
      expect(result.formats).toEqual([]);
      expect(result.priceByFormat).toEqual([]);
    });

    it("returns a null embed url when the trailer is not from YouTube", async () => {
      daoMock.findByIdWithFunctions.mockResolvedValue({
        ...movie(),
        trailerUrl: "https://vimeo.com/123",
      });
      expect((await service.findDetail(1)).trailerEmbedUrl).toBeNull();
    });

    it("throws NotFoundException when the movie does not exist", async () => {
      daoMock.findByIdWithFunctions.mockResolvedValue(null);
      await expect(service.findDetail(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findRecommendations", () => {
    it("returns similar movies of the same genre", async () => {
      daoMock.findByIdWithFunctions.mockResolvedValue(movie());
      daoMock.findSimilar.mockResolvedValue([{ id: 2, title: "Arrival" }]);

      const result = await service.findRecommendations(1, 6);

      expect(daoMock.findSimilar).toHaveBeenCalledWith("Ciencia ficción", 1, 6);
      expect(result).toEqual([{ id: 2, title: "Arrival" }]);
    });

    it("throws NotFoundException when the movie does not exist", async () => {
      daoMock.findByIdWithFunctions.mockResolvedValue(null);
      await expect(service.findRecommendations(99, 6)).rejects.toThrow(
        NotFoundException,
      );
      expect(daoMock.findSimilar).not.toHaveBeenCalled();
    });
  });
});
