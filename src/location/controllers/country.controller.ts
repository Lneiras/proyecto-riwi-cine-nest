import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CountryService } from "../services/country.service.js";
import { CreateAndUpdateCountryDto } from "../dto/country.dto.js";
import { Country } from "../entities/country.entity.js";

@Controller('countries')
export class CountryController {
  constructor(private readonly service: CountryService) {}

  @Post()
  async create(@Body() dto: CreateAndUpdateCountryDto): Promise<Country> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(): Promise<Country[]> {
    return this.service.findAll();
  }

  @Get(':name')
  async findOne(@Param('name') name: string): Promise<Country> {
    return this.service.findOneByName(name);
  }

  @Patch(':name')
  async update(@Param('name') name: string, @Body() dto: CreateAndUpdateCountryDto): Promise<Country | null> {
    return this.service.update(name, dto);
  }

  @Delete(':name/soft-delete')
  async softDelete(@Param('name') name: string): Promise<void> {
    return this.service.softDelete(name);
  }

  @Delete(':name')
  async delete(@Param('name') name: string): Promise<void> {
    return this.service.delete(name);
  }
}
