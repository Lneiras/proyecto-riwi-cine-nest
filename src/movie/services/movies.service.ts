import { BadRequestException, Injectable } from "@nestjs/common";
import { MoviesDao } from "../dao/movies.dao.js";
import { MovieFilterQueryDto } from "../dto/movies.dto.js";
import { Movie } from "../entities/movie.entity.js";

// Zona horaria de los cines. El servidor (o Docker) puede estar en UTC:
// a las 8:00 p. m. en Colombia ya es "mañana" en UTC, y la cartelera
// de "hoy" mostraría el día equivocado.
const CINEMA_TIME_ZONE = "America/Bogota";

// La cartelera semanal cubre hoy + los 6 días siguientes (7 días).
const BILLBOARD_DAYS = 7;

@Injectable()
export class MoviesService {
  constructor(private readonly dao: MoviesDao) {}

  // GET /movies/weekly
  async findWeekly(cityId: number): Promise<Movie[]> {
    const today = this.getToday();
    return this.dao.findBillboard({
      cityId,
      dateFrom: today,
      dateTo: this.addDays(today, BILLBOARD_DAYS - 1),
    });
  }

  // GET /movies/today
  async findToday(cityId: number): Promise<Movie[]> {
    const today = this.getToday();
    return this.dao.findBillboard({ cityId, dateFrom: today, dateTo: today });
  }

  // GET /movies/filter
  // Si no hay coincidencias se devuelve [] (200): para el frontend es el
  // "estado vacío" del Escenario 3, no un error.
  async filter(filters: MovieFilterQueryDto): Promise<Movie[]> {
    // Separamos "date" del resto: el DAO recibe un rango de fechas,
    // no una fecha suelta. otherFilters = cityId, genre, format, etc.
    const { date, ...otherFilters } = filters;

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

    return this.dao.findBillboard({ ...otherFilters, dateFrom, dateTo });
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
