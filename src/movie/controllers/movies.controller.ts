import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MoviesService } from "../services/movies.service.js";
import { BillboardQueryDto, MovieFilterQueryDto } from "../dto/movies.dto.js";
import { Movie } from "../entities/movie.entity.js";

// Ejemplos que se muestran en Swagger (solo documentación).
const BILLBOARD_EXAMPLE = [
  {
    id: 1,
    title: "Dune: Parte Dos",
    posterUrl: "https://ejemplo.com/dune.jpg",
    genre: "Ciencia ficción",
    classification: "12+",
    durationMinutes: 166,
    isActive: true,
    functions: [
      {
        id: 1,
        functionDate: "2026-10-16",
        basePrice: 18000,
        language: "SUBTITULADA",
        isActive: true,
        movieId: 1,
        roomId: 1,
        formatId: 2,
        showtimeId: 2,
        format: { id: 2, name: "IMAX", isActive: true },
        showtime: { id: 2, startTime: "19:00:00", isActive: true },
        room: {
          id: 1,
          number: 1,
          type: "IMAX",
          cinemaId: 1,
          isActive: true,
          cinema: {
            id: 1,
            name: "Riwi Cine El Poblado",
            cityId: 1,
            address: "Cra 43A",
            isActive: true,
          },
        },
      },
    ],
  },
];

const BAD_REQUEST_EXAMPLE = {
  statusCode: 400,
  timestamp: "2026-10-15T20:00:00.000Z",
  path: "/api/v1/movies/weekly",
  method: "GET",
  message: ["cityId must be an integer", "cityId must be greater than 0"],
};

// Cartelera pública (visitantes): no lleva JwtAuthGuard.
// IMPORTANTE para HU-004: cuando se agregue GET /movies/:id, debe ir
// DESPUÉS de estas rutas; si no, "weekly" se tomaría como un :id.
@ApiTags("Movies")
@Controller("movies")
export class MoviesController {
  constructor(private readonly service: MoviesService) {}

  @Get("weekly")
  @ApiOperation({
    summary: "Cartelera semanal de una ciudad",
    description:
      "Películas con funciones activas desde hoy hasta dentro de 6 días (7 días), con sus formatos y horarios",
  })
  @ApiResponse({
    status: 200,
    description:
      "Lista de películas con sus funciones. Lista vacía si la ciudad no tiene funciones",
    schema: { example: BILLBOARD_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: "cityId faltante o inválido",
    schema: { example: BAD_REQUEST_EXAMPLE },
  })
  findWeekly(@Query() query: BillboardQueryDto): Promise<Movie[]> {
    return this.service.findWeekly(query.cityId);
  }

  @Get("today")
  @ApiOperation({
    summary: "Cartelera de hoy de una ciudad",
    description: "Películas con funciones activas para la fecha de hoy",
  })
  @ApiResponse({
    status: 200,
    description:
      "Lista de películas con sus funciones de hoy. Lista vacía si no hay funciones",
    schema: { example: BILLBOARD_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: "cityId faltante o inválido",
    schema: { example: BAD_REQUEST_EXAMPLE },
  })
  findToday(@Query() query: BillboardQueryDto): Promise<Movie[]> {
    return this.service.findToday(query.cityId);
  }

  @Get("filter")
  @ApiOperation({
    summary: "Filtrar la cartelera semanal",
    description:
      "Filtros combinables: fecha, género, clasificación, idioma, formato, complejo y sala. Solo se devuelven las películas que cumplen TODOS los filtros",
  })
  @ApiResponse({
    status: 200,
    description:
      "Películas que cumplen todos los filtros. Lista vacía si no hay coincidencias",
    schema: { example: BILLBOARD_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description:
      "Algún filtro tiene un valor inválido o la fecha está fuera de los próximos 7 días",
    schema: {
      example: {
        ...BAD_REQUEST_EXAMPLE,
        path: "/api/v1/movies/filter?cityId=1&date=2026-12-31",
        message: "date must be between 2026-10-15 and 2026-10-21",
      },
    },
  })
  filter(@Query() query: MovieFilterQueryDto): Promise<Movie[]> {
    return this.service.filter(query);
  }
}
