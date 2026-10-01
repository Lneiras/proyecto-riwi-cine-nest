import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepartmentController } from "../controllers/department.controller.js";
import { CountryDepartmentsController } from "../controllers/country-departments.controller.js";
import { DepartmentDao } from "../dao/department.dao.js";
import { Department } from "../entities/department.entity.js";
import { CountryModule } from "./country.module.js";
import { DepartmentService } from "../services/department.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([Department]), CountryModule],
  controllers: [DepartmentController, CountryDepartmentsController],
  providers: [DepartmentDao, DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
