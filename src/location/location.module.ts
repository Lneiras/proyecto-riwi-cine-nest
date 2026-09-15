import { Module } from "@nestjs/common";
import { CityModule } from "./modules/city.module.js";
import { CountryModule } from "./modules/country.module.js";
import { DepartmentModule } from "./modules/department.module.js";

@Module({
  imports: [CountryModule, DepartmentModule, CityModule],
})
export class LocationModule {}
