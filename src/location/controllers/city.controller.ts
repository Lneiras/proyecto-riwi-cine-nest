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
import { CreateAndUpdateCityDto } from "../dto/city.dto.js";
import { CityService } from "../services/city.service.js";

@ApiTags("Locations")
@Controller("cities")
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post("create")
  @ApiOperation({ summary: "Crear una nueva ciudad" })
  async create(@Body() createCity: CreateAndUpdateCityDto) {
    return this.cityService.create(createCity);
  }

  @Get("allcities")
  @ApiOperation({ summary: "Obtener lista de todas las ciudades" })
  async getAll() {
    return this.cityService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una ciudad por su ID" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.cityService.findOne(id);
  }

  @Patch(":id/update")
  @ApiOperation({ summary: "Actualizar datos de una ciudad" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCity: CreateAndUpdateCityDto,
  ) {
    return this.cityService.update(id, updateCity);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar una ciudad por su ID" })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.cityService.delete(id);
  }
}
