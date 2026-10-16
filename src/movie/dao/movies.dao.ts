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
}

@Injectable()
export class MoviesDao {
  constructor(
    @InjectRepository(Movie) private readonly repository: Repository<Movie>,
  ) {}

  // Devuelve las películas que tienen al menos una función que cumple TODOS
  // los criterios. Cada película trae solo sus funciones que los cumplen.
  async findBillboard(criteria: BillboardCriteria): Promise<Movie[]> {
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

    return query
      .orderBy("movie.title", "ASC")
      .addOrderBy("fn.functionDate", "ASC")
      .addOrderBy("showtime.startTime", "ASC")
      .getMany();
  }
}
