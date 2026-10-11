import { Injectable, NotFoundException } from "@nestjs/common";
import { CityDao } from "../dao/city.dao.js";
import { ReqCreateCityDto, ReqUpdateCityDto } from "../dto/city.dto.js";
import { City } from "../entities/city.entity.js";
import { DepartmentService } from "./department.service.js";

@Injectable()
export class CityService {
  constructor(
    private readonly dao: CityDao,
    private readonly departmentService: DepartmentService,
  ) {}

  private async resolveDepartmentId(departmentName: string): Promise<number> {
    const department =
      await this.departmentService.findOneByName(departmentName);
    return department.id;
  }

  async create(dto: ReqCreateCityDto): Promise<City> {
    if (!dto.departmentName) {
      throw new NotFoundException("Department name is required");
    }
    const departmentId = await this.resolveDepartmentId(dto.departmentName);
    return this.dao.create({ name: dto.name, departmentId });
  }

  async createInDepartment(
    dto: ReqCreateCityDto,
    departmentName: string,
    countryName: string,
  ): Promise<City> {
    const department = await this.departmentService.findOneByNameInCountry(
      departmentName,
      countryName,
    );
    return this.dao.create({ name: dto.name, departmentId: department.id });
  }

  async findAll(): Promise<City[]> {
    return this.dao.findAll();
  }

  async findOneByName(name: string): Promise<City> {
    const item = await this.dao.findOneByName(name.trim().replace(/\s+/g, " "));
    if (!item) {
      throw new NotFoundException("City not found");
    }
    return item;
  }

  async findOneByNameInDepartment(
    name: string,
    departmentName: string,
    countryName: string,
  ): Promise<City> {
    const department = await this.departmentService.findOneByNameInCountry(
      departmentName,
      countryName,
    );
    const normalizedName = name.trim().replace(/\s+/g, " ");
    const item = await this.dao.findOneByNameAndDepartmentId(
      normalizedName,
      department.id,
    );
    if (!item) {
      throw new NotFoundException("City not found in department");
    }
    return item;
  }

  async findByDepartmentName(departmentName: string): Promise<City[]> {
    const departmentId = await this.resolveDepartmentId(departmentName);
    return this.dao.findByDepartmentId(departmentId);
  }

  async findByDepartmentAndCountry(
    departmentName: string,
    countryName: string,
  ): Promise<City[]> {
    const department = await this.departmentService.findOneByNameInCountry(
      departmentName,
      countryName,
    );
    return this.dao.findByDepartmentId(department.id);
  }

  async update(name: string, dto: ReqUpdateCityDto): Promise<City | null> {
    const item = await this.findOneByName(name);
    if (!dto.departmentName) {
      throw new NotFoundException("Department name is required");
    }
    const departmentId = await this.resolveDepartmentId(dto.departmentName);
    return this.dao.update(item.id, {
      name: dto.name ?? item.name,
      departmentId,
    });
  }

  async updateInDepartment(
    name: string,
    departmentName: string,
    countryName: string,
    dto: ReqUpdateCityDto,
  ): Promise<City | null> {
    const item = await this.findOneByNameInDepartment(
      name,
      departmentName,
      countryName,
    );
    return this.dao.update(item.id, {
      name: dto.name ?? item.name,
      departmentId: item.departmentId,
    });
  }

  async softDelete(name: string): Promise<void> {
    const item = await this.findOneByName(name);
    return this.dao.softDelete(item.id);
  }

  async softDeleteInDepartment(
    name: string,
    departmentName: string,
    countryName: string,
  ): Promise<void> {
    const item = await this.findOneByNameInDepartment(
      name,
      departmentName,
      countryName,
    );
    return this.dao.softDelete(item.id);
  }

  async delete(name: string): Promise<void> {
    const item = await this.findOneByName(name);
    return this.dao.delete(item.id);
  }

  async deleteInDepartment(
    name: string,
    departmentName: string,
    countryName: string,
  ): Promise<void> {
    const item = await this.findOneByNameInDepartment(
      name,
      departmentName,
      countryName,
    );
    return this.dao.delete(item.id);
  }
}
