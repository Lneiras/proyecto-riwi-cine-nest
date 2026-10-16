import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CreateShowtimeDto, UpdateShowtimeDto } from "../dto/showtime.dto.js";
import { AudioType, Showtime } from "../entities/showtime.entity.js";

/** Zona horaria con la que se interpreta el filtro `date` (Colombia, sin DST). */
export const CINEMA_TIME_ZONE = "America/Bogota";

export interface UpcomingShowtimesFilters {
  cityId?: number;
  cinemaId?: number;
  date?: string;
  language?: string;
  audioType?: AudioType;
  onlyAvailable?: boolean;
}

const DETAIL_RELATIONS = {
  movie: true,
  room: { cinema: { city: true } },
} as const;

@Injectable()
export class ShowtimeDao {
  constructor(
    @InjectRepository(Showtime)
    private readonly repository: Repository<Showtime>,
  ) {}

  async create(dto: CreateShowtimeDto): Promise<Showtime> {
    const entity = this.repository.create(dto as unknown as Showtime);
    const saved: Showtime = await this.repository.save(entity);
    return this.findById(saved.id) as Promise<Showtime>;
  }

  /**
   * Funciones activas y aún no iniciadas de una película (RN-014, análogo a
   * RN-035/RN-036), de cines y salas activos, ordenadas por hora de inicio.
   */
  async findUpcomingByMovieId(
    movieId: number,
    filters: UpcomingShowtimesFilters = {},
  ): Promise<Showtime[]> {
    const qb: SelectQueryBuilder<Showtime> = this.repository
      .createQueryBuilder("s")
      .innerJoinAndSelect("s.room", "room")
      .innerJoinAndSelect("room.cinema", "cinema")
      .innerJoinAndSelect("cinema.city", "city")
      .where("s.movieId = :movieId", { movieId })
      .andWhere("s.isActive = true")
      .andWhere("room.isActive = true")
      .andWhere("cinema.isActive = true")
      .andWhere("s.startsAt > :now", { now: new Date() });

    if (filters.cityId !== undefined) {
      qb.andWhere("city.id = :cityId", { cityId: filters.cityId });
    }
    if (filters.cinemaId !== undefined) {
      qb.andWhere("cinema.id = :cinemaId", { cinemaId: filters.cinemaId });
    }
    if (filters.date) {
      qb.andWhere(`(s.starts_at AT TIME ZONE :tz)::date = :date`, {
        tz: CINEMA_TIME_ZONE,
        date: filters.date,
      });
    }
    if (filters.language) {
      qb.andWhere("s.language ILIKE :language", { language: filters.language });
    }
    if (filters.audioType) {
      qb.andWhere("s.audioType = :audioType", { audioType: filters.audioType });
    }
    if (filters.onlyAvailable) {
      qb.andWhere("s.soldOut = false");
    }

    return qb.orderBy("s.startsAt", "ASC").addOrderBy("s.id", "ASC").getMany();
  }

  async findById(id: number): Promise<Showtime | null> {
    return this.repository.findOne({ where: { id }, relations: DETAIL_RELATIONS });
  }

  async update(id: number, dto: UpdateShowtimeDto): Promise<Showtime | null> {
    await this.repository.update(id, dto as any);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
