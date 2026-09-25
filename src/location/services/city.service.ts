import { Injectable, NotFoundException } from "@nestjs/common";
import { CityDao } from "../dao/city.dao.js";
import { CreateAndUpdateCityDto } from "../dto/city.dto.js";
import { DepartmentService } from "./department.service.js";

@Injectable()
export class CityService {
  constructor(
    private readonly cityDao: CityDao,
    private readonly departmentService: DepartmentService,
  ) {}

  async create(createCity: CreateAndUpdateCityDto) {
    const department = await this.departmentService.findOne(
      createCity.departmentId,
    );

    if (!department) {
      throw new NotFoundException(`The department doesn't exist`);
    }

    return this.cityDao.create(createCity);
  }

  async findAll() {
    return this.cityDao.findAll();
  }

  async findByDepartmentId(departmentId: number) {
    await this.departmentService.findOne(departmentId);
    return this.cityDao.findByDepartmentId(departmentId);
  }

  async findOne(id: number) {
    const city = await this.cityDao.findOne(id);
    if (!city) {
      throw new NotFoundException(`The city with ID ${id} does not exist`);
    }
    return city;
  }

  async update(id: number, data: CreateAndUpdateCityDto) {
    await this.findOne(id);

    const department = await this.departmentService.findOne(data.departmentId);

    if (!department) {
      throw new NotFoundException(`The department doesn't exist`);
    }

    return this.cityDao.update(id, data);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.cityDao.delete(id);
  }
}
