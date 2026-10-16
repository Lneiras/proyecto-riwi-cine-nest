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
import { CountryService } from "../services/country.service.js";
import { CreateAndUpdateCountryDto } from "../dto/country.dto.js";
import { Country } from "../entities/country.entity.js";

@ApiTags("Locations")
@Controller("countries")
export class CountryController {
  constructor(private readonly service: CountryService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo país" })
  async create(@Body() dto: CreateAndUpdateCountryDto): Promise<Country> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de todos los países activos" })
  async findAll(): Promise<Country[]> {
    return this.service.findAll();
  }

  @Get(":name")
  @ApiOperation({ summary: "Obtener un país por su nombre" })
  @ApiParam({ name: "name", description: "Nombre del país", example: "Colombia" })
  async findOne(@Param("name") name: string): Promise<Country> {
    return this.service.findOneByName(name);
  }

  @Patch(":name")
  @ApiOperation({ summary: "Actualizar datos de un país por su nombre" })
  @ApiParam({ name: "name", description: "Nombre del país actual", example: "Colombia" })
  async update(
    @Param("name") name: string,
    @Body() dto: CreateAndUpdateCountryDto,
  ): Promise<Country | null> {
    return this.service.update(name, dto);
  }

  @Delete(":name/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar un país de forma lógica (soft-delete en cascada)" })
  @ApiParam({ name: "name", description: "Nombre del país", example: "Colombia" })
  async softDelete(@Param("name") name: string): Promise<void> {
    return this.service.softDelete(name);
  }

  @Delete(":name")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente un país por su nombre" })
  @ApiParam({ name: "name", description: "Nombre del país", example: "Colombia" })
  async delete(@Param("name") name: string): Promise<void> {
    return this.service.delete(name);
  }
}
