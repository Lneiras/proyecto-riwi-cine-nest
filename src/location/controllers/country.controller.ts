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
import { CreateAndUpdateCountryDto } from "../dto/country.dto.js";
import { CountryService } from "../services/country.service.js";

@Controller("countries")
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post('create')
  async create(@Body() createCountry: CreateAndUpdateCountryDto) {
    return this.countryService.create(createCountry);
  }

  @Get('allcountries')
  async getAll() {
    return this.countryService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.countryService.findOne(id);
  }

  @Patch(":id/update")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCountry: CreateAndUpdateCountryDto,
  ) {
    return this.countryService.update(id, updateCountry);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT) // Returns 204 No Content after a successful deletion.
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.countryService.delete(id);
  }
}
