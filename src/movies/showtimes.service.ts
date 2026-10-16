import { Injectable, NotFoundException } from "@nestjs/common";
import { CinemasService } from "../cinema/services/cinemas.service.js";
import { RoomService } from "../cinema/services/room.service.js";
import { CityService } from "../location/services/city.service.js";
import { ShowtimeDao } from "./dao/showtime.dao.js";
import {
  CreateShowtimeDto,
  FunctionsQueryDto,
  ReqCreateShowtimeDto,
  ReqUpdateShowtimeDto,
  UpdateShowtimeDto,
} from "./dto/showtime.dto.js";
import { Showtime } from "./entities/showtime.entity.js";
import { MoviesService } from "./movies.service.js";
import { ShowtimeView } from "./movies.types.js";

export function toShowtimeView(showtime: Showtime): ShowtimeView {
  return {
    id: showtime.id,
    movieId: showtime.movieId,
    startsAt: showtime.startsAt,
    cinema: { id: showtime.room.cinema.id, name: showtime.room.cinema.name },
    city: { id: showtime.room.cinema.city.id, name: showtime.room.cinema.city.name },
    room: { id: showtime.room.id, number: showtime.room.number },
    format: showtime.room.type,
    language: showtime.language,
    audioType: showtime.audioType,
    price: Number(showtime.price),
    soldOut: showtime.soldOut,
  };
}

@Injectable()
export class ShowtimesService {
  constructor(
    private readonly showtimeDao: ShowtimeDao,
    private readonly moviesService: MoviesService,
    private readonly cinemasService: CinemasService,
    private readonly roomService: RoomService,
    private readonly cityService: CityService,
  ) {}

  /** POST /movies/:movieName/functions */
  async create(movieName: string, dto: ReqCreateShowtimeDto): Promise<ShowtimeView> {
    const movie = await this.moviesService.findOneByName(movieName);
    const room = await this.roomService.findByNumberInCinema(dto.roomNumber, dto.cinemaName);

    const createDto: CreateShowtimeDto = {
      movieId: movie.id,
      roomId: room.id,
      language: dto.language,
      audioType: dto.audioType,
      startsAt: new Date(dto.startsAt),
      price: dto.price,
    };

    const showtime = await this.showtimeDao.create(createDto);
    return toShowtimeView(showtime);
  }

  /** GET /movies/:movieName/functions — HU-004 (y base de HU-009). */
  async findByMovie(movieName: string, query: FunctionsQueryDto): Promise<ShowtimeView[]> {
    const movie = await this.moviesService.findOneByName(movieName);

    const cityId = query.cityName
      ? (await this.cityService.findOneByName(query.cityName)).id
      : undefined;
    let cinemaId: number | undefined;
    if (query.cinemaName) {
      const cinema = await this.cinemasService.findOneByName(query.cinemaName);
      if (!cinema) {
        throw new NotFoundException(`The cinema "${query.cinemaName}" does not exist`);
      }
      cinemaId = Number(cinema.id);
    }

    const showtimes = await this.showtimeDao.findUpcomingByMovieId(movie.id, {
      cityId,
      cinemaId,
      date: query.date,
      language: query.language,
      audioType: query.audioType,
      onlyAvailable: query.onlyAvailable,
    });

    return showtimes.map(toShowtimeView);
  }

  /** GET /movies/:movieName/functions/:id */
  async findOne(movieName: string, id: number): Promise<ShowtimeView> {
    const showtime = await this.findSelectable(movieName, id);
    return toShowtimeView(showtime);
  }

  async update(movieName: string, id: number, dto: ReqUpdateShowtimeDto): Promise<ShowtimeView> {
    await this.findSelectable(movieName, id);

    const changes: UpdateShowtimeDto = {
      language: dto.language,
      audioType: dto.audioType,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      price: dto.price,
      soldOut: dto.soldOut,
    };

    if (dto.cinemaName && dto.roomNumber !== undefined) {
      const room = await this.roomService.findByNumberInCinema(dto.roomNumber, dto.cinemaName);
      changes.roomId = room.id;
    }

    const updated = await this.showtimeDao.update(id, changes);
    return toShowtimeView(updated as Showtime);
  }

  async softDelete(movieName: string, id: number): Promise<void> {
    await this.findSelectable(movieName, id);
    return this.showtimeDao.softDelete(id);
  }

  async delete(movieName: string, id: number): Promise<void> {
    await this.findSelectable(movieName, id);
    return this.showtimeDao.delete(id);
  }

  private async findSelectable(movieName: string, id: number): Promise<Showtime> {
    const movie = await this.moviesService.findOneByName(movieName);
    const showtime = await this.showtimeDao.findById(id);

    if (!showtime || showtime.movieId !== movie.id) {
      throw new NotFoundException(`The function with ID ${id} does not exist for this movie`);
    }
    return showtime;
  }
}
