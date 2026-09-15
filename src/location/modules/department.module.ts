import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepartmentController } from "../controllers/department.controller.js";
import { DepartmentDao } from "../dao/department.dao.js";
import { Department } from "../entities/department.entity.js";
import { DepartmentService } from "../services/department.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [DepartmentController],
  providers: [DepartmentDao, DepartmentService],
})
export class DepartmentModule {}
