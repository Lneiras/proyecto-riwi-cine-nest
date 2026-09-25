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
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateAndUpdateDepartmentDto } from "../dto/department.dto.js";
import { DepartmentService } from "../services/department.service.js";

@ApiTags("Locations")
@Controller("departments")
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post("create")
  @ApiOperation({ summary: "Crear un nuevo departamento" })
  async create(@Body() createDepartment: CreateAndUpdateDepartmentDto) {
    return this.departmentService.create(createDepartment);
  }

  @Get("alldepartments")
  @ApiOperation({ summary: "Obtener lista de todos los departamentos" })
  async getAll() {
    return this.departmentService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un departamento por su ID" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.departmentService.findOne(id);
  }

  @Patch(":id/update")
  @ApiOperation({ summary: "Actualizar datos de un departamento" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDepartment: CreateAndUpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartment);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar un departamento por su ID" })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.departmentService.delete(id);
  }
}
