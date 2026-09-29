import { Injectable, NotFoundException } from "@nestjs/common";
import { CountryDao } from "../dao/country.dao.js";
import { CreateAndUpdateCountryDto } from "../dto/country.dto.js";
import { Country } from "../entities/country.entity.js";

@Injectable()
export class CountryService {
  constructor(private readonly dao: CountryDao) {}

  async create(dto: CreateAndUpdateCountryDto): Promise<Country> {
    return this.dao.create(dto);
  }

  async findAll(): Promise<Country[]> {
    return this.dao.findAll();
  }

  async findOneByName(name: string): Promise<Country> {
    const item = await this.dao.findOneByName(name.trim().replace(/\s+/g, ' '));
    if (!item) throw new NotFoundException("Country not found");
    return item;
  }

  async update(name: string, dto: CreateAndUpdateCountryDto): Promise<Country | null> {
    const item = await this.findOneByName(name);
    return this.dao.update(item.id, dto);
  }

  async softDelete(name: string): Promise<void> {
    const item = await this.findOneByName(name);
    return this.dao.softDelete(item.id);
  }

  async delete(name: string): Promise<void> {
    const item = await this.findOneByName(name);
    return this.dao.delete(item.id);
  }
}
