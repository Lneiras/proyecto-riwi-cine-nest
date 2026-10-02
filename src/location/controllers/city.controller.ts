import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CityService } from "../services/city.service.js";
import { ReqCreateCityDto, ReqUpdateCityDto } from "../dto/city.dto.js";
import { City } from "../entities/city.entity.js";

@Controller('countries/:countryName/departments/:departmentName/cities')
export class CityController {
  constructor(private readonly service: CityService) {}

  @Post()
  create(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Body() dto: ReqCreateCityDto): Promise<City> {
    return this.service.createInDepartment(dto, departmentName, countryName);
  }

  @Get()
  findAll(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string): Promise<City[]> {
    return this.service.findByDepartmentAndCountry(departmentName, countryName);
  }

  @Get(':cityName')
  findOne(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string): Promise<City> {
    return this.service.findOneByNameInDepartment(cityName, departmentName, countryName);
  }

  @Patch(':cityName')
  update(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string, @Body() dto: ReqUpdateCityDto): Promise<City | null> {
    return this.service.updateInDepartment(cityName, departmentName, countryName, dto);
  }

  @Delete(':cityName/soft-delete')
  softDelete(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string): Promise<void> {
    return this.service.softDeleteInDepartment(cityName, departmentName, countryName);
  }

  @Delete(':cityName')
  delete(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Param('cityName') cityName: string): Promise<void> {
    return this.service.deleteInDepartment(cityName, departmentName, countryName);
  }
}
