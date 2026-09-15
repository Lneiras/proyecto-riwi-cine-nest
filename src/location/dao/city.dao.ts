import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAndUpdateCityDto } from "../dto/city.dto.js";
import { City } from "../entities/city.entity.js";

@Injectable()
export class CityDao {
  constructor(
    @InjectRepository(City) private readonly repository: Repository<City>,
  ) {}

  async create(dto: CreateAndUpdateCityDto): Promise<City> {
    const newCity = this.repository.create(dto);
    return this.repository.save(newCity);
  }

  async findAll(): Promise<City[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<City | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: number, dto: CreateAndUpdateCityDto): Promise<City | null> {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
