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

    async create(dto: ReqCreateCinemaDto): Promise<Cinemas>{

        //this verifies if city of the cinema exists
        if (!dto.cityName) throw new NotFoundException("City name is required");
        const city = await this.cityService.findOneByName(dto.cityName.trim().replace(/\s+/g, ' '))
        if (!city) {
        throw new NotFoundException("The city doesn't exist, we can not create the cinema")
        }
        const { cityName, ...dtoData } = dto
        const cinemaWithId = {
            ...dtoData,
            cityId: city.id
        }

        return this.cinemasDao.create(cinemaWithId)
    }

    async findAll(): Promise<Cinemas[]>{
        return this.cinemasDao.findAll()
    }

    async createInCity(dto: ReqCreateCinemaDto, cityName: string, departmentName: string, countryName: string): Promise<Cinemas> {
        const city = await this.cityService.findOneByNameInDepartment(cityName, departmentName, countryName);
        const { cityName: _ignored, ...cinema } = dto;
        return this.cinemasDao.create({ ...cinema, cityId: city.id });
    }

    async findOne(id: number): Promise<Cinemas | null>{
        return this.cinemasDao.findOne(id)
    }

    async findOneByName(name: string): Promise<Cinemas | null>{
        return this.cinemasDao.findOneByName(name)
    }

    async update(name:string, dto: ReqUpdateCinemaDto): Promise<Cinemas | null>{

        const cinema = await this.findOneByName(name)
        if(!cinema){
            throw new NotFoundException("This cinema doesn't exist")
        }
        const id  = Number(cinema.id)

        const { cityName, ...dtoData } = dto;
        if (!cityName) return this.cinemasDao.update(id, dtoData);

        const city = await this.cityService.findOneByName(cityName.trim().replace(/\s+/g, ' '));
        return this.cinemasDao.update(id, { ...dtoData, cityId: city.id });
    }

    async findByCityName(nameCity: string): Promise<Cinemas[]|null>{
        return this.cinemasDao.findByCityName(nameCity)
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

    async softDelete(name: string): Promise<void>{
    const cinema = await this.findOneByName(name);
    if (!cinema) throw new NotFoundException("Cinema not found");
    return this.cinemasDao.softDelete(Number(cinema.id));
}

async delete(name: string): Promise<void>{
    const cinema = await this.findOneByName(name);
    if (!cinema) throw new NotFoundException("Cinema not found");
    return this.cinemasDao.delete(Number(cinema.id));
}

}

//FALTA HACER LO MISMO EN TODO PARA QUE EN VEZ DE BUSCAR POR ID BUSQUE POR NOMBRE, ESTO PARA EL FRONTEND
