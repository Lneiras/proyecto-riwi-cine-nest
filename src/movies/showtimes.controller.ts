import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import {
  FunctionsQueryDto,
  ReqCreateShowtimeDto,
  ReqUpdateShowtimeDto,
} from "./dto/showtime.dto.js";
import { ShowtimesService } from "./showtimes.service.js";

@ApiTags("Functions")
@Controller("movies/:movieName/functions")
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva función para una película" })
  @ApiParam({ name: "movieName", description: "Nombre de la película" })
  create(@Param("movieName") movieName: string, @Body() dto: ReqCreateShowtimeDto) {
    return this.showtimesService.create(movieName, dto);
  }

  @Get()
  @ApiOperation({
    summary: "Funciones futuras y activas de una película, con filtros (HU-004 / HU-009)",
  })
  @ApiParam({ name: "movieName", description: "Nombre de la película" })
  findAll(@Param("movieName") movieName: string, @Query() query: FunctionsQueryDto) {
    return this.showtimesService.findByMovie(movieName, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de una función" })
  @ApiParam({ name: "movieName", description: "Nombre de la película" })
  findOne(
    @Param("movieName") movieName: string,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.showtimesService.findOne(movieName, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar una función" })
  @ApiParam({ name: "movieName", description: "Nombre de la película" })
  update(
    @Param("movieName") movieName: string,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReqUpdateShowtimeDto,
  ) {
    return this.showtimesService.update(movieName, id, dto);
  }

  @Delete(":id/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar una función de forma lógica" })
  @ApiParam({ name: "movieName", description: "Nombre de la película" })
  softDelete(
    @Param("movieName") movieName: string,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<void> {
    return this.showtimesService.softDelete(movieName, id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente una función" })
  @ApiParam({ name: "movieName", description: "Nombre de la película" })
  delete(
    @Param("movieName") movieName: string,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<void> {
    return this.showtimesService.delete(movieName, id);
  }
}
