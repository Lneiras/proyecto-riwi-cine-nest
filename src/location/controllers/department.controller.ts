import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { DepartmentService } from "../services/department.service.js";
import {
  ReqCreateDepartmentDto,
  ReqUpdateDepartmentDto,
} from "../dto/department.dto.js";
import { Department } from "../entities/department.entity.js";

@ApiTags("Locations")
@Controller("countries/:countryName/departments")
export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo departamento dentro de un país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  create(
    @Param("countryName") countryName: string,
    @Body() dto: ReqCreateDepartmentDto,
  ): Promise<Department> {
    return this.service.create({ ...dto, countryName });
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de departamentos pertenecientes a un país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  findAll(@Param("countryName") countryName: string): Promise<Department[]> {
    return this.service.findByCountryName(countryName);
  }

  @Get(":departmentName")
  @ApiOperation({ summary: "Obtener un departamento por su nombre dentro de un país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  findOne(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
  ): Promise<Department> {
    return this.service.findOneByNameInCountry(departmentName, countryName);
  }

  @Patch(":departmentName")
  @ApiOperation({ summary: "Actualizar un departamento dentro de un país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre actual del departamento", example: "Antioquia" })
  update(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
    @Body() dto: ReqUpdateDepartmentDto,
  ): Promise<Department | null> {
    return this.service.updateInCountry(departmentName, countryName, dto);
  }

  @Delete(":departmentName/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar un departamento de forma lógica (soft-delete en cascada)" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  softDelete(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
  ): Promise<void> {
    return this.service.softDeleteInCountry(departmentName, countryName);
  }

  @Delete(":departmentName")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente un departamento por su nombre dentro de un país" })
  @ApiParam({ name: "countryName", description: "Nombre del país", example: "Colombia" })
  @ApiParam({ name: "departmentName", description: "Nombre del departamento", example: "Antioquia" })
  delete(
    @Param("countryName") countryName: string,
    @Param("departmentName") departmentName: string,
  ): Promise<void> {
    return this.service.deleteInCountry(departmentName, countryName);
  }
}
