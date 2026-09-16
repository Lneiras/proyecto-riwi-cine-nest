import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { DepartmentService } from "../services/department.service.js";

@Controller("countries/:countryId/departments")
export class CountryDepartmentsController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  findByCountry(@Param("countryId", ParseIntPipe) countryId: number) {
    return this.departmentService.findByCountryId(countryId);
  }
}
