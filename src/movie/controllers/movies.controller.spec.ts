// ⚠️ Prueba escrita en JEST (lineamiento del equipo).
// El repo todavía corre Vitest: esta prueba se ejecutará cuando se haga la
// migración de herramientas 
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Response } from "express";
import { MoviesController } from "./movies.controller.js";
import { MoviesService } from "../services/movies.service.js";
import { Movie } from "../entities/movie.entity.js";

describe("MoviesController", () => {
  let controller: MoviesController;
  let serviceMock: {
    findWeekly: jest.Mock<MoviesService["findWeekly"]>;
    findToday: jest.Mock<MoviesService["findToday"]>;
    filter: jest.Mock<MoviesService["filter"]>;
  };
  // Solo necesitamos setHeader de la respuesta de Express.
  let resMock: { setHeader: jest.Mock };

  const movies = [{ id: 1, title: "Dune: Parte Dos" }] as Movie[];

  beforeEach(() => {
    serviceMock = {
      findWeekly: jest.fn<MoviesService["findWeekly"]>(),
      findToday: jest.fn<MoviesService["findToday"]>(),
      filter: jest.fn<MoviesService["filter"]>(),
    };
    resMock = { setHeader: jest.fn() };
    controller = new MoviesController(serviceMock as unknown as MoviesService);
  });

  it("should return only the movies in the body and the total in X-Total-Count", async () => {
    serviceMock.findWeekly.mockResolvedValue({ items: movies, total: 23 });

    const body = await controller.findWeekly(
      { cityId: 1, page: 1, limit: 10 },
      resMock as unknown as Response,
    );

    expect(body).toEqual(movies);
    expect(resMock.setHeader).toHaveBeenCalledWith("X-Total-Count", 23);
  });

  it("should send X-Total-Count = 0 when there are no movies", async () => {
    serviceMock.filter.mockResolvedValue({ items: [], total: 0 });

    const body = await controller.filter(
      { cityId: 1, page: 1, limit: 10, genre: "Terror" },
      resMock as unknown as Response,
    );

    expect(body).toEqual([]);
    expect(resMock.setHeader).toHaveBeenCalledWith("X-Total-Count", 0);
  });

  it("should pass the query (with page and limit) to the service", async () => {
    serviceMock.findToday.mockResolvedValue({ items: movies, total: 1 });
    const query = { cityId: 2, page: 3, limit: 5 };

    await controller.findToday(query, resMock as unknown as Response);

    expect(serviceMock.findToday).toHaveBeenCalledWith(query);
  });
});
