import { Injectable, NotFoundException } from "@nestjs/common";
import { CityService } from "../location/services/city.service.js";
import { MovieDao } from "./dao/movie.dao.js";
import { ShowtimeDao } from "./dao/showtime.dao.js";
import { CreateMovieDto, UpdateMovieDto } from "./dto/movies.dto.js";
import { Movie } from "./entities/movie.entity.js";
import { FormatPriceRange, MovieDetail, MovieSummary } from "./movies.types.js";
import { toYoutubeEmbedUrl } from "./utils/youtube.util.js";

function toMovieSummary(movie: Movie): MovieSummary {
  return {
    id: movie.id,
    name: movie.name,
    genres: movie.genres ?? [],
    rating: movie.rating,
    durationMinutes: movie.durationMinutes,
    posterUrl: movie.posterUrl,
    averageRating: Number(movie.averageRating),
  };
}

@Injectable()
export class MoviesService {
  constructor(
    private readonly movieDao: MovieDao,
    private readonly showtimeDao: ShowtimeDao,
    private readonly cityService: CityService,
  ) {}

  async create(dto: CreateMovieDto): Promise<Movie> {
    return this.movieDao.create(dto);
  }

  async findAll(): Promise<Movie[]> {
    return this.movieDao.findAll();
  }

  async findOneByName(name: string): Promise<Movie> {
    const movie = await this.movieDao.findOneByName(name.trim().replace(/\s+/g, " "));
    if (!movie) {
      throw new NotFoundException(`The movie "${name}" does not exist`);
    }
    return movie;
  }

  /** GET /movies/:movieName — HU-004. */
  async findDetailByName(name: string, cityName?: string): Promise<MovieDetail> {
    const movie = await this.findOneByName(name);

    const cityId = cityName ? (await this.cityService.findOneByName(cityName)).id : undefined;

    // Formatos, idiomas y precios salen de las funciones futuras activas
    // (RN-014), acotadas a la ciudad cuando el visitante ya eligió una.
    const showtimes = await this.showtimeDao.findUpcomingByMovieId(movie.id, { cityId });

    const languages = new Set<string>();
    const priceRanges = new Map<string, FormatPriceRange>();

    for (const showtime of showtimes) {
      languages.add(showtime.language);

      const format = showtime.room.type;
      const price = Number(showtime.price);
      const range = priceRanges.get(format);
      priceRanges.set(format, {
        format,
        minPrice: Math.min(range?.minPrice ?? price, price),
        maxPrice: Math.max(range?.maxPrice ?? price, price),
      });
    }

    return {
      ...toMovieSummary(movie),
      synopsis: movie.synopsis,
      director: movie.director,
      actors: movie.actors ?? [],
      releaseDate: movie.releaseDate,
      bannerUrl: movie.bannerUrl,
      trailerUrl: movie.trailerUrl,
      trailerEmbedUrl: toYoutubeEmbedUrl(movie.trailerUrl),
      languages: [...languages].sort(),
      formats: [...priceRanges.keys()].sort(),
      priceByFormat: [...priceRanges.values()].sort((a, b) => a.format.localeCompare(b.format)),
    };
  }

  /** GET /movies/:movieName/recommendations — películas similares por género. */
  async findRecommendations(name: string, limit: number): Promise<MovieSummary[]> {
    const movie = await this.findOneByName(name);
    const similar = await this.movieDao.findSimilar(movie.genres ?? [], movie.id, limit);
    return similar.map(toMovieSummary);
  }

  async update(name: string, dto: UpdateMovieDto): Promise<Movie | null> {
    const movie = await this.findOneByName(name);
    return this.movieDao.update(movie.id, dto);
  }

  async softDelete(name: string): Promise<void> {
    const movie = await this.findOneByName(name);
    return this.movieDao.softDelete(movie.id);
  }

  async delete(name: string): Promise<void> {
    const movie = await this.findOneByName(name);
    return this.movieDao.delete(movie.id);
  }
}
