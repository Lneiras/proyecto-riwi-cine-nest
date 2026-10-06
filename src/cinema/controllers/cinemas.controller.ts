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
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CinemasService } from "../services/cinemas.service.js";
import { ReqCreateCinemaDto, ReqUpdateCinemaDto } from "../dto/cinemas.dto.js";
import { Cinemas } from "../entities/cinemas.entity.js";
import { CityExists } from "../guards/cinemas.guard.js";

@ApiTags("Cinemas")
@UseGuards(CityExists)
@Controller("countries/:countryName/departments/:departmentName/cities/:cityName/cinemas")
export class CinemasController {
  constructor(private readonly cinemasService: CinemasService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo cine en una ciudad" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  create(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
    @Body() dto: ReqCreateCinemaDto,
  ): Promise<Cinemas> {
    return this.cinemasService.createInCity(dto, cityName, departmentName, countryName);
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de cines pertenecientes a una ciudad" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  findAll(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
  ): Promise<Cinemas[]> {
    return this.cinemasService.findByCityInDepartment(cityName, departmentName, countryName);
  }

  @Get(":cinemaName")
  @ApiOperation({ summary: "Obtener un cine por su nombre en una ciudad" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  findOne(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
    @Param("cinemaName") cinemaName: string,
  ): Promise<Cinemas> {
    return this.cinemasService.findOneByNameInCity(cinemaName, cityName, departmentName, countryName);
  }

  @Patch(":cinemaName")
  @ApiOperation({ summary: "Actualizar datos de un cine en una ciudad" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  @ApiParam({ name: "cinemaName", description: "Nombre actual del cine", example: "Cine Colombia Santa Fe" })
  update(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
    @Param("cinemaName") cinemaName: string,
    @Body() dto: ReqUpdateCinemaDto,
  ): Promise<Cinemas | null> {
    return this.cinemasService.updateInCity(cinemaName, cityName, departmentName, countryName, dto);
  }

  @Delete(":cinemaName/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar un cine de forma lógica (soft-delete en cascada)" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  softDelete(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
    @Param("cinemaName") cinemaName: string,
  ): Promise<void> {
    return this.cinemasService.softDeleteInCity(cinemaName, cityName, departmentName, countryName);
  }

  @Delete(":cinemaName")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente un cine en una ciudad" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  delete(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
    @Param("cinemaName") cinemaName: string,
  ): Promise<void> {
    return this.cinemasService.deleteInCity(cinemaName, cityName, departmentName, countryName);
  }
}
