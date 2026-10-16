import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { MoviesService } from "./movies.service.js";
import { MovieDao } from "./dao/movie.dao.js";
import { ShowtimeDao } from "./dao/showtime.dao.js";
import { CityService } from "../location/services/city.service.js";

const movie = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 1,
    name: "Dune: Parte Dos",
    durationMinutes: 155,
    rating: "PG-13",
    genres: ["Ciencia ficción", "Aventura"],
    synopsis: "Sinopsis",
    director: "Denis Villeneuve",
    actors: ["Timothée Chalamet"],
    releaseDate: "2026-03-01",
    posterUrl: "p.jpg",
    bannerUrl: "b.jpg",
    trailerUrl: "https://youtu.be/dQw4w9WgXcQ",
    averageRating: "4.50",
    isActive: true,
    ...overrides,
  }) as any;

const showtime = (room: { type: string }, language: string, price: string) =>
  ({ room, language, price }) as any;

describe("MoviesService", () => {
  let service: MoviesService;
  let movieDao: { findOneByName: ReturnType<typeof vi.fn>; findSimilar: ReturnType<typeof vi.fn>; findAll: ReturnType<typeof vi.fn> };
  let showtimeDao: { findUpcomingByMovieId: ReturnType<typeof vi.fn> };
  let cityService: { findOneByName: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    movieDao = { findOneByName: vi.fn(), findSimilar: vi.fn(), findAll: vi.fn() };
    showtimeDao = { findUpcomingByMovieId: vi.fn().mockResolvedValue([]) };
    cityService = { findOneByName: vi.fn() };
    service = new MoviesService(
      movieDao as unknown as MovieDao,
      showtimeDao as unknown as ShowtimeDao,
      cityService as unknown as CityService,
    );
  });

  describe("findDetailByName", () => {
    it("returns the full detail with embed trailer, formats, languages and price ranges", async () => {
      movieDao.findOneByName.mockResolvedValue(movie());
      showtimeDao.findUpcomingByMovieId.mockResolvedValue([
        showtime({ type: "3d" }, "Español", "20000.00"),
        showtime({ type: "2d" }, "Español", "14000.00"),
        showtime({ type: "2d" }, "Inglés", "16000.00"),
      ]);

      const result = await service.findDetailByName("Dune: Parte Dos");

      expect(movieDao.findOneByName).toHaveBeenCalledWith("Dune: Parte Dos");
      expect(cityService.findOneByName).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        id: 1,
        name: "Dune: Parte Dos",
        director: "Denis Villeneuve",
        actors: ["Timothée Chalamet"],
        trailerEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        averageRating: 4.5,
      });
      expect(result.formats).toEqual(["2d", "3d"]);
      expect(result.languages).toEqual(["Español", "Inglés"]);
      expect(result.priceByFormat).toEqual([
        { format: "2d", minPrice: 14000, maxPrice: 16000 },
        { format: "3d", minPrice: 20000, maxPrice: 20000 },
      ]);
    });

    it("resolves the city name to an id and scopes the query to it", async () => {
      movieDao.findOneByName.mockResolvedValue(movie());
      cityService.findOneByName.mockResolvedValue({ id: 5, name: "Medellín" });

      await service.findDetailByName("Dune: Parte Dos", "Medellín");

      expect(cityService.findOneByName).toHaveBeenCalledWith("Medellín");
      expect(showtimeDao.findUpcomingByMovieId).toHaveBeenCalledWith(1, { cityId: 5 });
    });

    it("returns empty formats/languages when there are no upcoming functions", async () => {
      movieDao.findOneByName.mockResolvedValue(movie({ trailerUrl: null, actors: null }));

      const result = await service.findDetailByName("Dune: Parte Dos");

      expect(result.formats).toEqual([]);
      expect(result.languages).toEqual([]);
      expect(result.priceByFormat).toEqual([]);
      expect(result.actors).toEqual([]);
      expect(result.trailerEmbedUrl).toBeNull();
    });

    it("throws NotFoundException when the movie does not exist", async () => {
      movieDao.findOneByName.mockResolvedValue(null);
      await expect(service.findDetailByName("Unknown")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findRecommendations", () => {
    it("returns similar movies as summaries", async () => {
      movieDao.findOneByName.mockResolvedValue(movie());
      movieDao.findSimilar.mockResolvedValue([movie({ id: 2, name: "Arrival" })]);

      const result = await service.findRecommendations("Dune: Parte Dos", 6);

      expect(movieDao.findSimilar).toHaveBeenCalledWith(["Ciencia ficción", "Aventura"], 1, 6);
      expect(result).toEqual([
        expect.objectContaining({ id: 2, name: "Arrival", rating: "PG-13" }),
      ]);
      expect(result[0]).not.toHaveProperty("synopsis");
    });

    it("throws NotFoundException when the movie does not exist", async () => {
      movieDao.findOneByName.mockResolvedValue(null);
      await expect(service.findRecommendations("Unknown", 6)).rejects.toThrow(NotFoundException);
    });
  });
});
