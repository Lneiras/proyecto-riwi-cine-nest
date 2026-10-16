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
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CityService } from "../services/city.service.js";
import { ReqCreateCityDto, ReqUpdateCityDto } from "../dto/city.dto.js";
import { City } from "../entities/city.entity.js";

@ApiTags("Locations")
@Controller("countries/:countryName/departments/:departmentName/cities")
export class CityController {
  constructor(private readonly service: CityService) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva ciudad dentro de un departamento y país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  create(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Body() dto: ReqCreateCityDto,
  ): Promise<City> {
    return this.service.createInDepartment(dto, departmentName, countryName);
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de ciudades pertenecientes a un departamento y país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  findAll(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
  ): Promise<City[]> {
    return this.service.findByDepartmentAndCountry(departmentName, countryName);
  }

  @Get(":cityName")
  @ApiOperation({ summary: "Obtener una ciudad por su nombre dentro de un departamento y país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  findOne(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
  ): Promise<City> {
    return this.service.findOneByNameInDepartment(cityName, departmentName, countryName);
  }

  @Patch(":cityName")
  @ApiOperation({ summary: "Actualizar datos de una ciudad dentro de un departamento y país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre actual de la ciudad", example: "Medellín" })
  update(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
    @Body() dto: ReqUpdateCityDto,
  ): Promise<City | null> {
    return this.service.updateInDepartment(cityName, departmentName, countryName, dto);
  }

  @Delete(":cityName/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar una ciudad de forma lógica (soft-delete en cascada)" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  softDelete(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
  ): Promise<void> {
    return this.service.softDeleteInDepartment(cityName, departmentName, countryName);
  }

  @Delete(":cityName")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente una ciudad por su nombre" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  @ApiParam({ name: "cityName", description: "Nombre de la ciudad", example: "Medellín" })
  delete(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Param("cityName") cityName: string,
  ): Promise<void> {
    return this.service.deleteInDepartment(cityName, departmentName, countryName);
  }
}
