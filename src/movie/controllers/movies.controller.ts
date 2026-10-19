import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import {
  MoviesService,
  type PaginatedMovies,
} from "../services/movies.service.js";
import {
  BillboardQueryDto,
  MovieDetailQueryDto,
  MovieFilterQueryDto,
  RecommendationsQueryDto,
} from "../dto/movies.dto.js";
import { Movie } from "../entities/movie.entity.js";
import type { MovieDetail } from "../movie.types.js";

// Header donde va el total de películas (todas las páginas).
// El body sigue siendo la lista, como en el resto de la API.
const TOTAL_COUNT_HEADER = "X-Total-Count";

// Documentación del header para Swagger.
const TOTAL_COUNT_HEADER_DOC = {
  [TOTAL_COUNT_HEADER]: {
    description:
      "Total de películas que cumplen los criterios (todas las páginas)",
    schema: { type: "integer", example: 23 },
  },
};

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
    headers: TOTAL_COUNT_HEADER_DOC,
  })
  @ApiResponse({
    status: 400,
    description: "cityId faltante o inválido, o page/limit inválidos",
    schema: { example: BAD_REQUEST_EXAMPLE },
  })
  async findWeekly(
    @Query() query: BillboardQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Movie[]> {
    const page = await this.service.findWeekly(query);
    return this.sendPage(res, page);
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
    headers: TOTAL_COUNT_HEADER_DOC,
  })
  @ApiResponse({
    status: 400,
    description: "cityId faltante o inválido, o page/limit inválidos",
    schema: { example: BAD_REQUEST_EXAMPLE },
  })
  async findToday(
    @Query() query: BillboardQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Movie[]> {
    const page = await this.service.findToday(query);
    return this.sendPage(res, page);
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
    headers: TOTAL_COUNT_HEADER_DOC,
  })
  @ApiResponse({
    status: 400,
    description:
      "Algún filtro o page/limit tiene un valor inválido, o la fecha está fuera de los próximos 7 días",
    schema: {
      example: {
        ...BAD_REQUEST_EXAMPLE,
        path: "/api/v1/movies/filter?cityId=1&date=2026-12-31",
        message: "date must be between 2026-10-15 and 2026-10-21",
      },
    },
  })
  async filter(
    @Query() query: MovieFilterQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Movie[]> {
    const page = await this.service.filter(query);
    return this.sendPage(res, page);
  }

  // ===== HU-004: detalle de película =====
  // ⚠️ Van DESPUÉS de weekly, today y filter: si se declararan antes,
  // "weekly" se tomaría como un :id.
  @Get(":id")
  @ApiOperation({
    summary: "Detalle de una película (HU-004)",
    description:
      "Datos completos, tráiler embebible y funciones futuras con sus idiomas, formatos y rango de precio. Con cityId se acotan a esa ciudad",
  })
  @ApiParam({ name: "id", description: "ID de la película", example: 1 })
  @ApiResponse({ status: 200, description: "Detalle de la película" })
  @ApiResponse({ status: 404, description: "La película no existe o está inactiva" })
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @Query() query: MovieDetailQueryDto,
  ): Promise<MovieDetail> {
    return this.service.findDetail(id, query.cityId);
  }

  @Get(":id/recommendations")
  @ApiOperation({
    summary: "Películas similares (HU-004)",
    description: "Películas activas del mismo género, mejor calificadas primero",
  })
  @ApiParam({ name: "id", description: "ID de la película", example: 1 })
  @ApiResponse({ status: 200, description: "Lista de películas similares (puede ser vacía)" })
  @ApiResponse({ status: 404, description: "La película no existe o está inactiva" })
  findRecommendations(
    @Param("id", ParseIntPipe) id: number,
    @Query() query: RecommendationsQueryDto,
  ): Promise<Movie[]> {
    return this.service.findRecommendations(id, query.limit);
  }

  // Pone el total en el header y devuelve solo la lista (el body).
  // @Res({ passthrough: true }) nos deja tocar la respuesta (headers)
  // y aun así Nest envía lo que retornamos como JSON.
  private sendPage(res: Response, page: PaginatedMovies): Movie[] {
    res.setHeader(TOTAL_COUNT_HEADER, page.total);
    return page.items;
  }
}
