import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ShowtimesService } from "./showtimes.service.js";
import { ShowtimeDao } from "./dao/showtime.dao.js";
import { MoviesService } from "./movies.service.js";
import { CinemasService } from "../cinema/services/cinemas.service.js";
import { RoomService } from "../cinema/services/room.service.js";
import { CityService } from "../location/services/city.service.js";
import { AudioType } from "./entities/showtime.entity.js";

const showtime = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 10,
    movieId: 1,
    startsAt: new Date("2026-11-01T20:00:00.000Z"),
    language: "Español",
    audioType: AudioType.SUBTITLED,
    price: "18000.00",
    soldOut: false,
    room: {
      id: 3,
      number: 2,
      type: "imax",
      cinema: { id: 4, name: "Cine Riwi", city: { id: 5, name: "Medellín" } },
    },
    ...overrides,
  }) as any;

describe("ShowtimesService", () => {
  let service: ShowtimesService;
  let showtimeDao: {
    create: ReturnType<typeof vi.fn>;
    findUpcomingByMovieId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    softDelete: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let moviesService: { findOneByName: ReturnType<typeof vi.fn> };
  let cinemasService: { findOneByName: ReturnType<typeof vi.fn> };
  let roomService: { findByNumberInCinema: ReturnType<typeof vi.fn> };
  let cityService: { findOneByName: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    showtimeDao = {
      create: vi.fn(),
      findUpcomingByMovieId: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      delete: vi.fn(),
    };
    moviesService = { findOneByName: vi.fn().mockResolvedValue({ id: 1, name: "Dune" }) };
    cinemasService = { findOneByName: vi.fn() };
    roomService = { findByNumberInCinema: vi.fn() };
    cityService = { findOneByName: vi.fn() };

    service = new ShowtimesService(
      showtimeDao as unknown as ShowtimeDao,
      moviesService as unknown as MoviesService,
      cinemasService as unknown as CinemasService,
      roomService as unknown as RoomService,
      cityService as unknown as CityService,
    );
  });

  describe("create", () => {
    it("resolves the cinema+room by name and creates the function", async () => {
      roomService.findByNumberInCinema.mockResolvedValue({ id: 3 });
      showtimeDao.create.mockResolvedValue(showtime());

      const result = await service.create("Dune", {
        cinemaName: "Cine Riwi",
        roomNumber: 2,
        language: "Español",
        audioType: AudioType.SUBTITLED,
        startsAt: "2026-11-01T20:00:00-05:00",
        price: 18000,
      });

      expect(roomService.findByNumberInCinema).toHaveBeenCalledWith(2, "Cine Riwi");
      expect(showtimeDao.create).toHaveBeenCalledWith({
        movieId: 1,
        roomId: 3,
        language: "Español",
        audioType: AudioType.SUBTITLED,
        startsAt: new Date("2026-11-01T20:00:00-05:00"),
        price: 18000,
      });
      expect(result.format).toBe("imax");
      expect(result.city).toEqual({ id: 5, name: "Medellín" });
    });
  });

  describe("findByMovie", () => {
    it("resolves cityName and cinemaName before querying and maps the result", async () => {
      cityService.findOneByName.mockResolvedValue({ id: 5, name: "Medellín" });
      cinemasService.findOneByName.mockResolvedValue({ id: 4, name: "Cine Riwi" });
      showtimeDao.findUpcomingByMovieId.mockResolvedValue([showtime(), showtime({ id: 11, soldOut: true })]);

      const result = await service.findByMovie("Dune", {
        cityName: "Medellín",
        cinemaName: "Cine Riwi",
        date: "2026-11-01",
        language: "Español",
        audioType: AudioType.SUBTITLED,
        onlyAvailable: false,
      });

      expect(showtimeDao.findUpcomingByMovieId).toHaveBeenCalledWith(1, {
        cityId: 5,
        cinemaId: 4,
        date: "2026-11-01",
        language: "Español",
        audioType: AudioType.SUBTITLED,
        onlyAvailable: false,
      });
      expect(result).toHaveLength(2);
      expect(result[1].soldOut).toBe(true);
    });

    it("throws NotFoundException when the cinema does not exist", async () => {
      cinemasService.findOneByName.mockResolvedValue(null);
      await expect(service.findByMovie("Dune", { cinemaName: "Unknown" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findOne / update / delete", () => {
    it("returns the function detail scoped to the movie", async () => {
      showtimeDao.findById.mockResolvedValue(showtime());
      const result = await service.findOne("Dune", 10);
      expect(result).toMatchObject({ id: 10, cinema: { id: 4, name: "Cine Riwi" } });
    });

    it("throws NotFoundException when the function belongs to another movie", async () => {
      showtimeDao.findById.mockResolvedValue(showtime({ movieId: 2 }));
      await expect(service.findOne("Dune", 10)).rejects.toThrow(NotFoundException);
    });

    it("throws NotFoundException when the function does not exist", async () => {
      showtimeDao.findById.mockResolvedValue(null);
      await expect(service.softDelete("Dune", 99)).rejects.toThrow(NotFoundException);
      expect(showtimeDao.softDelete).not.toHaveBeenCalled();
    });

    it("updates resolving the new room when cinemaName+roomNumber are provided", async () => {
      showtimeDao.findById.mockResolvedValue(showtime());
      roomService.findByNumberInCinema.mockResolvedValue({ id: 9 });
      showtimeDao.update.mockResolvedValue(showtime({ id: 10 }));

      await service.update("Dune", 10, { cinemaName: "Otro Cine", roomNumber: 1, soldOut: true });

      expect(roomService.findByNumberInCinema).toHaveBeenCalledWith(1, "Otro Cine");
      expect(showtimeDao.update).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ roomId: 9, soldOut: true }),
      );
    });

    it("deletes after verifying the function belongs to the movie", async () => {
      showtimeDao.findById.mockResolvedValue(showtime());
      await service.delete("Dune", 10);
      expect(showtimeDao.delete).toHaveBeenCalledWith(10);
    });
  });
});
