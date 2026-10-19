import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Movie, MovieClassification } from "../entities/movie.entity.js";
import { FunctionLanguage } from "../entities/function.entity.js";

// Criterios que el service le entrega al DAO.
// El service ya calculó el rango de fechas; el DAO solo arma la consulta.
export interface BillboardCriteria {
  cityId: number;
  dateFrom: string; // "YYYY-MM-DD" (incluida)
  dateTo: string; // "YYYY-MM-DD" (incluida)
  genre?: string;
  classification?: MovieClassification;
  language?: FunctionLanguage;
  format?: string;
  cinemaId?: number;
  roomId?: number;
  skip: number; // cuántas películas saltar (páginas anteriores)
  take: number; // cuántas películas traer (tamaño de la página)
}

@Injectable()
export class MoviesDao {
  constructor(
    @InjectRepository(Movie) private readonly repository: Repository<Movie>,
  ) {}

  // Devuelve UNA PÁGINA de películas que tienen al menos una función que
  // cumple TODOS los criterios, y el total de películas (todas las páginas).
  // Cada película trae solo sus funciones que cumplen los criterios.
  async findBillboard(criteria: BillboardCriteria): Promise<[Movie[], number]> {
    // QueryBuilder: construimos el SQL paso a paso.
    // "innerJoin" descarta las películas que no tienen funciones que coincidan.
    const query = this.repository
      .createQueryBuilder("movie")
      .innerJoinAndSelect("movie.functions", "fn")
      .innerJoinAndSelect("fn.format", "format")
      .innerJoinAndSelect("fn.showtime", "showtime")
      .innerJoinAndSelect("fn.room", "room")
      .innerJoinAndSelect("room.cinema", "cinema")
      // Solo registros activos.
      .where("movie.isActive = true")
      .andWhere("fn.isActive = true")
      .andWhere("format.isActive = true")
      .andWhere("showtime.isActive = true")
      .andWhere("room.isActive = true")
      .andWhere("cinema.isActive = true")
      // Ciudad y rango de fechas (siempre presentes).
      // Los valores van como parámetros (:cityId) y no pegados al texto:
      // así TypeORM los escapa y evitamos inyección SQL.
      .andWhere("cinema.cityId = :cityId", { cityId: criteria.cityId })
      .andWhere("fn.functionDate BETWEEN :dateFrom AND :dateTo", {
        dateFrom: criteria.dateFrom,
        dateTo: criteria.dateTo,
      });

    // Filtros opcionales: solo se agregan si vienen en los criterios.
    if (criteria.genre) {
      query.andWhere("LOWER(movie.genre) = LOWER(:genre)", {
        genre: criteria.genre,
      });
    }
    if (criteria.classification) {
      query.andWhere("movie.classification = :classification", {
        classification: criteria.classification,
      });
    }
    if (criteria.language) {
      query.andWhere("fn.language = :language", {
        language: criteria.language,
      });
    }
    if (criteria.format) {
      query.andWhere("LOWER(format.name) = LOWER(:format)", {
        format: criteria.format,
      });
    }
    if (criteria.cinemaId) {
      query.andWhere("cinema.id = :cinemaId", { cinemaId: criteria.cinemaId });
    }
    if (criteria.roomId) {
      query.andWhere("room.id = :roomId", { roomId: criteria.roomId });
    }

    // Paginación: skip/take cuentan PELÍCULAS, no filas del JOIN.
    // ⚠️ Con joins, TypeORM solo pagina bien si el orden usa columnas de
    // la entidad principal (movie). Por eso aquí NO ordenamos por fecha
    // u hora de la función: las funciones se ordenan abajo.
    // movie.id va de desempate: si dos películas tienen el mismo título,
    // el orden sigue siendo estable entre páginas.
    const [movies, total] = await query
      .orderBy("movie.title", "ASC")
      .addOrderBy("movie.id", "ASC")
      .skip(criteria.skip)
      .take(criteria.take)
      .getManyAndCount();

    // Ordenamos las funciones de cada película por fecha y hora.
    // Comparar strings "YYYY-MM-DD" y "HH:MM:SS" sirve como comparar fechas.
    for (const movie of movies) {
      movie.functions.sort((a, b) =>
        (a.functionDate + a.showtime.startTime).localeCompare(
          b.functionDate + b.showtime.startTime,
        ),
      );
    }

    return [movies, total];
  }

  // GET /movies/:id (HU-004). Trae la película activa con sus funciones
  // activas desde `dateFrom`, opcionalmente solo las de una ciudad.
  // LEFT JOIN: si no hay funciones, la película igual se devuelve (functions=[]).
  async findByIdWithFunctions(
    id: number,
    options: { cityId?: number; dateFrom: string },
  ): Promise<Movie | null> {
    const query = this.repository
      .createQueryBuilder("movie")
      .leftJoinAndSelect(
        "movie.functions",
        "fn",
        "fn.isActive = true AND fn.functionDate >= :dateFrom",
        { dateFrom: options.dateFrom },
      )
      .leftJoinAndSelect("fn.format", "format", "format.isActive = true")
      .leftJoinAndSelect("fn.showtime", "showtime", "showtime.isActive = true")
      .leftJoinAndSelect("fn.room", "room", "room.isActive = true")
      .leftJoinAndSelect("room.cinema", "cinema", "cinema.isActive = true")
      .where("movie.id = :id", { id })
      .andWhere("movie.isActive = true");

    if (options.cityId !== undefined) {
      query.andWhere("(fn.id IS NULL OR cinema.cityId = :cityId)", {
        cityId: options.cityId,
      });
    }

    const movie = await query.getOne();

    if (movie?.functions) {
      // Descartamos funciones a medias (formato/horario/sala/cine inactivos
      // dejan esas relaciones en null por el LEFT JOIN) y ordenamos.
      movie.functions = movie.functions
        .filter((fn) => fn.format && fn.showtime && fn.room?.cinema)
        .sort((a, b) =>
          (a.functionDate + a.showtime.startTime).localeCompare(
            b.functionDate + b.showtime.startTime,
          ),
        );
    }

    return movie;
  }

  // GET /movies/:id/recommendations (HU-004). Películas activas del mismo
  // género (sin distinguir mayúsculas), mejor calificadas primero.
  async findSimilar(
    genre: string,
    excludeId: number,
    limit: number,
  ): Promise<Movie[]> {
    return this.repository
      .createQueryBuilder("movie")
      .where("movie.isActive = true")
      .andWhere("movie.id != :excludeId", { excludeId })
      .andWhere("LOWER(movie.genre) = LOWER(:genre)", { genre })
      .orderBy("movie.averageRating", "DESC")
      .addOrderBy("movie.title", "ASC")
      .addOrderBy("movie.id", "ASC")
      .take(limit)
      .getMany();
  }
}
