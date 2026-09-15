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
import { CreateAndUpdateCityDto } from "../dto/city.dto.js";
import { CityService } from "../services/city.service.js";

@Controller("cities")
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post("create")
  async create(@Body() createCity: CreateAndUpdateCityDto) {
    return this.cityService.create(createCity);
  }

  @Get("allcities")
  async getAll() {
    return this.cityService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.cityService.findOne(id);
  }

  @Patch(":id/update")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCity: CreateAndUpdateCityDto,
  ) {
    return this.cityService.update(id, updateCity);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.cityService.delete(id);
  }
}
