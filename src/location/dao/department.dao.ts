import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAndUpdateDepartmentDto } from "../dto/department.dto.js";
import { Department } from "../entities/department.entity.js";

@Injectable()
export class DepartmentDao {
  constructor(
    @InjectRepository(Department)
    private readonly repository: Repository<Department>,
  ) {}

  async create(dto: CreateAndUpdateDepartmentDto): Promise<Department> {
    const newDepartment = this.repository.create(dto);
    return this.repository.save(newDepartment);
  }

  async findAll(): Promise<Department[]> {
    return this.repository.find();
  }

  async findByCountryId(countryId: number): Promise<Department[]> {
    return this.repository.find({
      where: { countryId },
      order: { name: "ASC" },
    });
  }

  async findOne(id: number): Promise<Department | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(
    id: number,
    dto: CreateAndUpdateDepartmentDto,
  ): Promise<Department | null> {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
