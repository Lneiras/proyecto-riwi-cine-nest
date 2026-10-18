// ⚠️ Prueba escrita en JEST (lineamiento del equipo).
// El repo todavía corre Vitest: esta prueba se ejecutará cuando se haga la
// migración de herramientas (rama chore/migrar-jest-eslint).
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import { MoviesService } from "./movies.service.js";
import { MoviesDao } from "../dao/movies.dao.js";
import { Movie } from "../entities/movie.entity.js";
import { FunctionLanguage } from "../entities/function.entity.js";

describe("MoviesService", () => {
  let service: MoviesService;
  // Mock del DAO: no tocamos la base de datos, solo verificamos
  // con qué criterios el service llama al DAO.
  let daoMock: { findBillboard: jest.Mock<MoviesDao["findBillboard"]> };

  const moviesFromDb = [{ id: 1, title: "Dune: Parte Dos" }] as Movie[];

  // Paginación por defecto (la que pone el DTO si no se envía nada).
  const firstPage = { page: 1, limit: 10 };

  beforeEach(() => {
    // Congelamos el reloj: 15 de octubre de 2026, 10:00 a. m. en Colombia
    // (15:00 en UTC). Así "hoy" siempre es el mismo día en la prueba.
    jest.useFakeTimers({ now: new Date("2026-10-15T15:00:00Z") });

    daoMock = { findBillboard: jest.fn<MoviesDao["findBillboard"]>() };
    // El DAO devuelve [películas de la página, total de películas].
    daoMock.findBillboard.mockResolvedValue([moviesFromDb, 23]);

    service = new MoviesService(daoMock as unknown as MoviesDao);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("findWeekly", () => {
    it("should search from today to 6 days later in the given city", async () => {
      const result = await service.findWeekly({ cityId: 1, ...firstPage });

      expect(daoMock.findBillboard).toHaveBeenCalledWith({
        cityId: 1,
        dateFrom: "2026-10-15",
        dateTo: "2026-10-21",
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ items: moviesFromDb, total: 23 });
    });

    it("should use the Colombia date even if it is already tomorrow in UTC", async () => {
      // 16 oct 02:00 UTC = 15 oct 9:00 p. m. en Colombia.
      jest.setSystemTime(new Date("2026-10-16T02:00:00Z"));

      await service.findWeekly({ cityId: 1, ...firstPage });

      expect(daoMock.findBillboard).toHaveBeenCalledWith(
        expect.objectContaining({ dateFrom: "2026-10-15" }),
      );
    });

    it("should move to the next month when the week crosses it", async () => {
      jest.setSystemTime(new Date("2026-10-28T15:00:00Z"));

      await service.findWeekly({ cityId: 1, ...firstPage });

      expect(daoMock.findBillboard).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: "2026-10-28",
          dateTo: "2026-11-03",
        }),
      );
    });
  });

  describe("findToday", () => {
    it("should search only today's functions", async () => {
      await service.findToday({ cityId: 2, ...firstPage });

      expect(daoMock.findBillboard).toHaveBeenCalledWith({
        cityId: 2,
        dateFrom: "2026-10-15",
        dateTo: "2026-10-15",
        skip: 0,
        take: 10,
      });
    });
  });

  describe("pagination", () => {
    it("should skip the movies of the previous pages", async () => {
      // Página 3 de 10 en 10 → saltar 20 películas y traer 10.
      await service.findWeekly({ cityId: 1, page: 3, limit: 10 });

      expect(daoMock.findBillboard).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it("should use the limit as the page size", async () => {
      await service.findToday({ cityId: 1, page: 2, limit: 5 });

      expect(daoMock.findBillboard).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it("should return the total even when the page is empty", async () => {
      daoMock.findBillboard.mockResolvedValue([[], 23]);

      const result = await service.findWeekly({
        cityId: 1,
        page: 99,
        limit: 10,
      });

      expect(result).toEqual({ items: [], total: 23 });
    });
  });

  describe("filter", () => {
    it("should search the whole week and pass all filters when no date is sent", async () => {
      await service.filter({
        cityId: 1,
        ...firstPage,
        genre: "Animación",
        language: FunctionLanguage.DOBLADA,
        format: "2D",
      });

      // page y limit NO llegan al DAO: se convierten en skip y take.
      expect(daoMock.findBillboard).toHaveBeenCalledWith({
        cityId: 1,
        genre: "Animación",
        language: FunctionLanguage.DOBLADA,
        format: "2D",
        dateFrom: "2026-10-15",
        dateTo: "2026-10-21",
        skip: 0,
        take: 10,
      });
    });

    it("should search only the requested date when it is inside the week", async () => {
      await service.filter({ cityId: 1, ...firstPage, date: "2026-10-18" });

      expect(daoMock.findBillboard).toHaveBeenCalledWith({
        cityId: 1,
        dateFrom: "2026-10-18",
        dateTo: "2026-10-18",
        skip: 0,
        take: 10,
      });
    });

    it("should paginate the filtered results", async () => {
      await service.filter({ cityId: 1, page: 2, limit: 3, genre: "Terror" });

      expect(daoMock.findBillboard).toHaveBeenCalledWith(
        expect.objectContaining({ genre: "Terror", skip: 3, take: 3 }),
      );
    });

    it("should throw BadRequestException when the date is before today", async () => {
      await expect(
        service.filter({ cityId: 1, ...firstPage, date: "2026-10-14" }),
      ).rejects.toThrow(BadRequestException);
      expect(daoMock.findBillboard).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when the date is after the 7-day window", async () => {
      await expect(
        service.filter({ cityId: 1, ...firstPage, date: "2026-10-22" }),
      ).rejects.toThrow(BadRequestException);
      expect(daoMock.findBillboard).not.toHaveBeenCalled();
    });

    it("should return an empty list when no movie matches the filters", async () => {
      daoMock.findBillboard.mockResolvedValue([[], 0]);

      const result = await service.filter({
        cityId: 1,
        ...firstPage,
        genre: "Terror",
      });

      expect(result).toEqual({ items: [], total: 0 });
    });
  });
});
