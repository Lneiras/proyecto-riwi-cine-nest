import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CinemasService } from "../services/cinemas.service.js";
import { ReqCreateCinemaDto, ReqUpdateCinemaDto } from "../dto/cinemas.dto.js";
import { Cinemas } from "../entities/cinemas.entity.js";

@Controller('countries/:countryName/departments/:departmentName/cities/:cityName/cinemas')
export class CinemasController {
  constructor(private readonly cinemasService: CinemasService) {}

  @Post()
  create(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string, @Body() dto: ReqCreateCinemaDto): Promise<Cinemas> {
    return this.cinemasService.createInCity(dto, cityName, departmentName, countryName);
  }

  @Get()
  findAll(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string): Promise<Cinemas[]> {
    return this.cinemasService.findByCityInDepartment(cityName, departmentName, countryName);
  }

  @Get(':cinemaName')
  findOne(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string, @Param('cinemaName') cinemaName: string): Promise<Cinemas> {
    return this.cinemasService.findOneByNameInCity(cinemaName, cityName, departmentName, countryName);
  }

  @Patch(':cinemaName')
  update(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string, @Param('cinemaName') cinemaName: string, @Body() dto: ReqUpdateCinemaDto): Promise<Cinemas | null> {
    return this.cinemasService.updateInCity(cinemaName, cityName, departmentName, countryName, dto);
  }

  @Delete(':cinemaName/soft-delete')
  softDelete(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string, @Param('cinemaName') cinemaName: string): Promise<void> {
    return this.cinemasService.softDeleteInCity(cinemaName, cityName, departmentName, countryName);
  }

  @Delete(':cinemaName')
  delete(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string, @Param('cinemaName') cinemaName: string): Promise<void> {
    return this.cinemasService.deleteInCity(cinemaName, cityName, departmentName, countryName);
  }
}
