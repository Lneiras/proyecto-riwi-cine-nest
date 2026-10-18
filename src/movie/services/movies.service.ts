import { BadRequestException, Injectable } from "@nestjs/common";
import { type BillboardCriteria, MoviesDao } from "../dao/movies.dao.js";
import { BillboardQueryDto, MovieFilterQueryDto } from "../dto/movies.dto.js";
import { Movie } from "../entities/movie.entity.js";

// Zona horaria de los cines. El servidor (o Docker) puede estar en UTC:
// a las 8:00 p. m. en Colombia ya es "mañana" en UTC, y la cartelera
// de "hoy" mostraría el día equivocado.
const CINEMA_TIME_ZONE = "America/Bogota";

// La cartelera semanal cubre hoy + los 6 días siguientes (7 días).
const BILLBOARD_DAYS = 7;

// Resultado paginado que el service le entrega al controller:
// - items: las películas de la página pedida (va en el body).
// - total: cuántas películas hay en TODAS las páginas (va en el header).
export interface PaginatedMovies {
  items: Movie[];
  total: number;
}

@Injectable()
export class MoviesService {
  constructor(private readonly dao: MoviesDao) {}

  // GET /movies/weekly
  async findWeekly(query: BillboardQueryDto): Promise<PaginatedMovies> {
    const today = this.getToday();
    return this.findPage(query, {
      cityId: query.cityId,
      dateFrom: today,
      dateTo: this.addDays(today, BILLBOARD_DAYS - 1),
    });
  }

  // GET /movies/today
  async findToday(query: BillboardQueryDto): Promise<PaginatedMovies> {
    const today = this.getToday();
    return this.findPage(query, {
      cityId: query.cityId,
      dateFrom: today,
      dateTo: today,
    });
  }

  // GET /movies/filter
  // Si no hay coincidencias se devuelve [] (200): para el frontend es el
  // "estado vacío" del Escenario 3, no un error.
  async filter(filters: MovieFilterQueryDto): Promise<PaginatedMovies> {
    // Separamos "date", "page" y "limit" del resto: el DAO recibe un rango
    // de fechas y skip/take. otherFilters = cityId, genre, format, etc.
    const { date, page, limit, ...otherFilters } = filters;

    const today = this.getToday();
    const lastDay = this.addDays(today, BILLBOARD_DAYS - 1);

    // Sin fecha: toda la semana. Con fecha: solo ese día.
    let dateFrom = today;
    let dateTo = lastDay;

    if (date) {
      // La fecha debe estar dentro de la semana de cartelera.
      // Comparar strings "YYYY-MM-DD" funciona igual que comparar fechas.
      if (date < today || date > lastDay) {
        throw new BadRequestException(
          `date must be between ${today} and ${lastDay}`,
        );
      }
      dateFrom = date;
      dateTo = date;
    }

    return this.findPage(
      { page, limit },
      { ...otherFilters, dateFrom, dateTo },
    );
  }

  // Convierte page/limit en skip/take y consulta el DAO.
  // Ejemplo: page=3, limit=10 → saltar 20 películas y traer 10.
  // Pick<BillboardQueryDto, "page" | "limit"> = solo page y limit del DTO.
  // Omit<BillboardCriteria, "skip" | "take"> = todos los criterios
  // MENOS skip y take, porque esos dos los calculamos aquí.
  private async findPage(
    pagination: Pick<BillboardQueryDto, "page" | "limit">,
    criteria: Omit<BillboardCriteria, "skip" | "take">,
  ): Promise<PaginatedMovies> {
    const [items, total] = await this.dao.findBillboard({
      ...criteria,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return { items, total };
  }

  // Fecha de hoy en Colombia con formato "YYYY-MM-DD".
  // El locale "en-CA" (Canadá) formatea justamente como YYYY-MM-DD.
  private getToday(): string {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: CINEMA_TIME_ZONE,
    });
  }

  // Suma días a una fecha "YYYY-MM-DD" (maneja cambios de mes y año).
  private addDays(date: string, days: number): string {
    const result = new Date(`${date}T00:00:00Z`);
    result.setUTCDate(result.getUTCDate() + days);
    return result.toISOString().slice(0, 10);
  }
}
