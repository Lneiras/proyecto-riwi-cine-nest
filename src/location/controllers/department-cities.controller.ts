import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { CityService } from "../services/city.service.js";

@Controller("departments/:departmentId/cities")
export class DepartmentCitiesController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  findByDepartment(
    @Param("departmentId", ParseIntPipe) departmentId: number,
  ) {
    return this.cityService.findByDepartmentId(departmentId);
  }
}
