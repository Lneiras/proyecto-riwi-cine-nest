import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CreateMovieDto, MovieDetailQueryDto, RecommendationsQueryDto, UpdateMovieDto } from "./dto/movies.dto.js";
import { Movie } from "./entities/movie.entity.js";
import { MoviesService } from "./movies.service.js";
import { MovieDetail, MovieSummary } from "./movies.types.js";

@ApiTags("Movies")
@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva película" })
  create(@Body() dto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de todas las películas activas" })
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Get(":movieName")
  @ApiOperation({ summary: "Detalle completo de una película, por su nombre (HU-004)" })
  @ApiParam({ name: "movieName", description: "Nombre de la película", example: "Dune: Parte Dos" })
  findOne(
    @Param("movieName") movieName: string,
    @Query() query: MovieDetailQueryDto,
  ): Promise<MovieDetail> {
    return this.moviesService.findDetailByName(movieName, query.cityName);
  }

  @Get(":movieName/recommendations")
  @ApiOperation({ summary: "Películas similares por género (HU-004)" })
  @ApiParam({ name: "movieName", description: "Nombre de la película", example: "Dune: Parte Dos" })
  findRecommendations(
    @Param("movieName") movieName: string,
    @Query() query: RecommendationsQueryDto,
  ): Promise<MovieSummary[]> {
    return this.moviesService.findRecommendations(movieName, query.limit);
  }

  @Patch(":movieName")
  @ApiOperation({ summary: "Actualizar datos de una película" })
  @ApiParam({ name: "movieName", description: "Nombre actual de la película" })
  update(
    @Param("movieName") movieName: string,
    @Body() dto: UpdateMovieDto,
  ): Promise<Movie | null> {
    return this.moviesService.update(movieName, dto);
  }

  @Delete(":movieName/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar una película de forma lógica (soft-delete en cascada)" })
  @ApiParam({ name: "movieName", description: "Nombre de la película" })
  softDelete(@Param("movieName") movieName: string): Promise<void> {
    return this.moviesService.softDelete(movieName);
  }

  @Delete(":movieName")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente una película" })
  @ApiParam({ name: "movieName", description: "Nombre de la película" })
  delete(@Param("movieName") movieName: string): Promise<void> {
    return this.moviesService.delete(movieName);
  }
}
