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
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateAndUpdateCountryDto } from "../dto/country.dto.js";
import { CountryService } from "../services/country.service.js";

@ApiTags("Locations")
@Controller("countries")
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post("create")
  @ApiOperation({ summary: "Crear un nuevo país" })
  async create(@Body() createCountry: CreateAndUpdateCountryDto) {
    return this.countryService.create(createCountry);
  }

  @Get("allcountries")
  @ApiOperation({ summary: "Obtener lista de todos los países" })
  async getAll() {
    return this.countryService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un país por su ID" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.countryService.findOne(id);
  }

  @Patch(":id/update")
  @ApiOperation({ summary: "Actualizar datos de un país" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCountry: CreateAndUpdateCountryDto,
  ) {
    return this.countryService.update(id, updateCountry);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar un país por su ID" })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.countryService.delete(id);
  }
}
