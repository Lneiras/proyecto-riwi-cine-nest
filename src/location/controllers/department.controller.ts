import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateAndUpdateDepartmentDto } from "../dto/department.dto.js";
import { DepartmentService } from "../services/department.service.js";

@Controller("departments")
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post("create")
  async create(@Body() createDepartment: CreateAndUpdateDepartmentDto) {
    return this.departmentService.create(createDepartment);
  }

  @Get("alldepartments")
  async getAll() {
    return this.departmentService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.departmentService.findOne(id);
  }

  @Patch(":id/update")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDepartment: CreateAndUpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartment);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.departmentService.delete(id);
  }
}
