import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CityService } from "../services/city.service.js";

@ApiTags("Locations")
@Controller("departments/:departmentId/cities")
export class DepartmentCitiesController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  @ApiOperation({
    summary: "Obtener ciudades pertenecientes a un departamento específico",
  })
  findByDepartment(@Param("departmentId", ParseIntPipe) departmentId: number) {
    return this.cityService.findByDepartmentId(departmentId);
  }
}
