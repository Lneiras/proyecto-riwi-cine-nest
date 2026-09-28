import { Injectable, NotFoundException } from "@nestjs/common";
import { DepartmentDao } from "../dao/department.dao.js";
import { ReqCreateAndUpdateDepartmentDto } from "../dto/department.dto.js";
import { Department } from "../entities/department.entity.js";
import { CountryService } from "./country.service.js";

@Injectable()
export class DepartmentService {
  constructor(
    private readonly dao: DepartmentDao,
    private readonly countryService: CountryService
  ) {}

  private async resolveCountryId(countryName: string): Promise<number> {
    const country = await this.countryService.findOneByName(countryName);
    return country.id;
  }

  async create(dto: ReqCreateAndUpdateDepartmentDto): Promise<Department> {
    if (!dto.countryName) throw new NotFoundException("Country name is required");
    const countryId = await this.resolveCountryId(dto.countryName);
    return this.dao.create({ name: dto.name, countryId });
  }

  async findAll(): Promise<Department[]> {
    return this.dao.findAll();
  }

  async findOneByName(name: string): Promise<Department> {
    const item = await this.dao.findOneByName(name.trim().replace(/\s+/g, ' '));
    if (!item) throw new NotFoundException("Department not found");
    return item;
  }

  async findOneByNameInCountry(name: string, countryName: string): Promise<Department> {
    const countryId = await this.resolveCountryId(countryName);
    const normalizedName = name.trim().replace(/\s+/g, " ");
    const item = await this.dao.findOneByNameAndCountryId(normalizedName, countryId);
    if (!item) throw new NotFoundException("Department not found in country");
    return item;
  }

  async findByCountryName(countryName: string): Promise<Department[]> {
    const countryId = await this.resolveCountryId(countryName);
    return this.dao.findByCountryId(countryId);
  }

  async update(name: string, dto: ReqCreateAndUpdateDepartmentDto): Promise<Department | null> {
    const item = await this.findOneByName(name);
    if (!dto.countryName) throw new NotFoundException("Country name is required");
    const countryId = await this.resolveCountryId(dto.countryName);
    return this.dao.update(item.id, { name: dto.name, countryId });
  }

  async updateInCountry(name: string, countryName: string, dto: ReqCreateAndUpdateDepartmentDto): Promise<Department | null> {
    const item = await this.findOneByNameInCountry(name, countryName);
    return this.dao.update(item.id, { name: dto.name, countryId: item.countryId });
  }

  async softDelete(name: string): Promise<void> {
    const item = await this.findOneByName(name);
    return this.dao.softDelete(item.id);
  }

  async softDeleteInCountry(name: string, countryName: string): Promise<void> {
    const item = await this.findOneByNameInCountry(name, countryName);
    return this.dao.softDelete(item.id);
  }

  async delete(name: string): Promise<void> {
    const item = await this.findOneByName(name);
    return this.dao.delete(item.id);
  }

  async deleteInCountry(name: string, countryName: string): Promise<void> {
    const item = await this.findOneByNameInCountry(name, countryName);
    return this.dao.delete(item.id);
  }
}
