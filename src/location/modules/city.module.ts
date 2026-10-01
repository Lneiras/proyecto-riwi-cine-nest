import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityController } from "../controllers/city.controller.js";
import { DepartmentCitiesController } from "../controllers/department-cities.controller.js";
import { CityDao } from "../dao/city.dao.js";
import { City } from "../entities/city.entity.js";
import { DepartmentModule } from "./department.module.js";
import { CityService } from "../services/city.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([City]), DepartmentModule],
  controllers: [CityController, DepartmentCitiesController],
  providers: [CityDao, CityService],
})
export class CityModule {}
