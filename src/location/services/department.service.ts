import { Injectable, NotFoundException } from "@nestjs/common";
import { DepartmentDao } from "../dao/department.dao.js";
import { CreateAndUpdateDepartmentDto } from "../dto/department.dto.js";
import { CountryService } from "./country.service.js";

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentDao: DepartmentDao, private readonly countryService: CountryService) {}

  async create(createDepartment: CreateAndUpdateDepartmentDto) {

    const country = await this.countryService.findOne(createDepartment.countryId)

    if(!country){
      throw new NotFoundException(`The country doesn't exist`)
    }

    return this.departmentDao.create(createDepartment);
  }

  async findAll() {
    return this.departmentDao.findAll();
  }

  async findOne(id: number) {
    const department = await this.departmentDao.findOne(id);
    if (!department) {
      throw new NotFoundException(
        `The department with ID ${id} does not exist`,
      );
    }
    return department;
  }

  async update(id: number, data: CreateAndUpdateDepartmentDto) {

    await this.findOne(id);

    const country = await this.countryService.findOne(data.countryId)

    if(!country){
      throw new NotFoundException(`The country doesn't exist`)
    }

    return this.departmentDao.update(id, data);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.departmentDao.delete(id);
  }
}
