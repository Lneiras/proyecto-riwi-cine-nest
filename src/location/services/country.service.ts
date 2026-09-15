import { Injectable, NotFoundException } from "@nestjs/common";
import { CountryDao } from "../dao/country.dao.js";
import { CreateAndUpdateCountryDto } from "../dto/country.dto.js";

@Injectable()
export class CountryService {
  constructor(private readonly countryDao: CountryDao) {}

  async create(createCountry: CreateAndUpdateCountryDto) {
    return this.countryDao.create(createCountry);
  }

  async findAll() {
    return this.countryDao.findAll();
  }

  async findOne(id: number) {
    const country = await this.countryDao.findOne(id);
    if (!country) {
      throw new NotFoundException(`The country with ID ${id} does not exist`);
    }
    return country;
  }

  async update(id: number, data: CreateAndUpdateCountryDto) {
    // Ensure the country exists before updating it.
    await this.findOne(id);
    return this.countryDao.update(id, data);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.countryDao.delete(id);
  }
}
