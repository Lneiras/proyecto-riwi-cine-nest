import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAndUpdateCountryDto } from "../dto/country.dto.js";
import { Country } from "../entities/country.entity.js";

@Injectable()
export class CountryDao {
  constructor(
    @InjectRepository(Country) private readonly repository: Repository<Country>,
  ) {}

  async create(dto: CreateAndUpdateCountryDto): Promise<Country> {
    const newCountry = this.repository.create(dto);
    return this.repository.save(newCountry);
  }

  async findAll(): Promise<Country[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Country | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(
    id: number,
    dto: CreateAndUpdateCountryDto,
  ): Promise<Country | null> {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
