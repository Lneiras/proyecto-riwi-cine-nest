import { Injectable, NotFoundException } from "@nestjs/common";
import { CityDao } from "../dao/city.dao.js";
import { CreateAndUpdateCityDto } from "../dto/city.dto.js";

@Injectable()
export class CityService {
  constructor(private readonly cityDao: CityDao) {}

  async create(createCity: CreateAndUpdateCityDto) {
    return this.cityDao.create(createCity);
  }

  async findAll() {
    return this.cityDao.findAll();
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
    return this.cityDao.update(id, data);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.cityDao.delete(id);
  }
}
