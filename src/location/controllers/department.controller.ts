import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { DepartmentService } from "../services/department.service.js";
import { ReqCreateDepartmentDto, ReqUpdateDepartmentDto } from "../dto/department.dto.js";
import { Department } from "../entities/department.entity.js";

@Controller('countries/:countryName/departments')
export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}

  @Post()
  create(@Param('countryName') countryName: string, @Body() dto: ReqCreateDepartmentDto): Promise<Department> {
    return this.service.create({ ...dto, countryName });
  }

  @Get()
  findAll(@Param('countryName') countryName: string): Promise<Department[]> {
    return this.service.findByCountryName(countryName);
  }

  @Get(':departmentName')
  findOne(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string): Promise<Department> {
    return this.service.findOneByNameInCountry(departmentName, countryName);
  }

  @Patch(':departmentName')
  update(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string, @Body() dto: ReqUpdateDepartmentDto): Promise<Department | null> {
    return this.service.updateInCountry(departmentName, countryName, dto);
  }

  @Delete(':departmentName/soft-delete')
  softDelete(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string): Promise<void> {
    return this.service.softDeleteInCountry(departmentName, countryName);
  }

  @Delete(':departmentName')
  delete(@Param('countryName') countryName: string, @Param('departmentName') departmentName: string): Promise<void> {
    return this.service.deleteInCountry(departmentName, countryName);
  }
}
