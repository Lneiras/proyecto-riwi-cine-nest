import { Injectable, NotFoundException } from "@nestjs/common";
import { CinemasDao } from "../dao/cinemas.dao.js";
import { ReqCreateCinemaDto, ReqUpdateCinemaDto } from "../dto/cinemas.dto.js";
import { Cinemas } from "../entities/cinemas.entity.js";
import { CityService } from "../../location/services/city.service.js";


@Injectable()
export class CinemasService {
    constructor(private readonly cinemasDao: CinemasDao,
                private readonly cityService: CityService
    ){}

    async createInCity(dto: ReqCreateCinemaDto, cityName: string, departmentName: string, countryName: string): Promise<Cinemas> {
        const city = await this.cityService.findOneByNameInDepartment(cityName, departmentName, countryName);
        const { cityName: _ignored, ...cinema } = dto;
        return this.cinemasDao.create({ ...cinema, cityId: city.id });
    }

    async findOneByName(name: string): Promise<Cinemas | null>{
        return this.cinemasDao.findOneByName(name)
    }

    async findByCityInDepartment(
        cityName: string,
        departmentName: string,
        countryName: string
    ): Promise<Cinemas[]> {
        const city = await this.cityService.findOneByNameInDepartment(
            cityName,
            departmentName,
            countryName
        );
        return this.cinemasDao.findByCityId(city.id);
    }

    async findOneByNameInCity(
        name: string,
        cityName: string,
        departmentName: string,
        countryName: string,
    ): Promise<Cinemas> {
        const city = await this.cityService.findOneByNameInDepartment(
            cityName,
            departmentName,
            countryName,
        );
        const cinema = await this.cinemasDao.findOneByNameAndCityId(name.trim().replace(/\s+/g, ' '), city.id);
        if (!cinema) throw new NotFoundException("Cinema not found in city");
        return cinema;
    }

    async updateInCity(name: string, cityName: string, departmentName: string, countryName: string, dto: ReqUpdateCinemaDto): Promise<Cinemas | null> {
        const cinema = await this.findOneByNameInCity(name, cityName, departmentName, countryName);
        const { cityName: _ignored, ...changes } = dto;
        return this.cinemasDao.update(Number(cinema.id), changes);
    }

    async softDeleteInCity(name: string, cityName: string, departmentName: string, countryName: string): Promise<void> {
        const cinema = await this.findOneByNameInCity(name, cityName, departmentName, countryName);
        return this.cinemasDao.softDelete(Number(cinema.id));
    }

    async deleteInCity(name: string, cityName: string, departmentName: string, countryName: string): Promise<void> {
        const cinema = await this.findOneByNameInCity(name, cityName, departmentName, countryName);
        return this.cinemasDao.delete(Number(cinema.id));
    }

}
