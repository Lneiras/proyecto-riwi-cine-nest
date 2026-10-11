import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepartmentController } from "../controllers/department.controller.js";
import { DepartmentDao } from "../dao/department.dao.js";
import { Department } from "../entities/department.entity.js";
import { CountryModule } from "./country.module.js";
import { DepartmentService } from "../services/department.service.js";
import { DepartmentExists } from "../guards/department.guard.js";

@Module({
  imports: [TypeOrmModule.forFeature([Department]), CountryModule],
  controllers: [DepartmentController],
  providers: [DepartmentDao, DepartmentService, DepartmentExists],
  exports: [DepartmentService, DepartmentExists],
})
export class DepartmentModule {}
