import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DepartmentService } from "../services/department.service.js";

@ApiTags("Locations")
@Controller("countries/:countryId/departments")
export class CountryDepartmentsController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({
    summary: "Obtener departamentos pertenecientes a un país específico",
  })
  findByCountry(@Param("countryId", ParseIntPipe) countryId: number) {
    return this.departmentService.findByCountryId(countryId);
  }
}
