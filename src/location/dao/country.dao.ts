import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, In, Repository } from "typeorm";
import { CreateAndUpdateCountryDto } from "../dto/country.dto.js";
import { Country } from "../entities/country.entity.js";
import { Department } from "../entities/department.entity.js";
import { City } from "../entities/city.entity.js";
import { Cinemas } from "../../cinema/entities/cinemas.entity.js";
import { Room } from "../../cinema/entities/room.entity.js";
import { Row } from "../../cinema/entities/row.entity.js";
import { Seat } from "../../cinema/entities/seats.entity.js";

@Injectable()
export class CountryDao {
  constructor(
    @InjectRepository(Country) private readonly repository: Repository<Country>,
    private readonly dataSource: DataSource
  ) {}

  async create(dto: CreateAndUpdateCountryDto): Promise<Country> {
    return this.repository.save(this.repository.create(dto));
  }

  async findAll(): Promise<Country[]> {
    return this.repository.find({ where: { isActive: true } as any });
  }

  async findOne(id: number): Promise<Country | null> {
    return this.repository.findOne({ where: { id, isActive: true } as any });
  }

  async findOneByName(name: string): Promise<Country | null> {
    return this.repository.findOne({ where: { name: ILike(name), isActive: true } as any });
  }

  async update(id: number, dto: CreateAndUpdateCountryDto): Promise<Country | null> {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const departmentRepository = manager.getRepository(Department);
      const departments = await departmentRepository.find({
        where: { countryId: id },
        select: { id: true },
      });
      const departmentIds = departments.map(({ id: departmentId }) => departmentId);

      if (departmentIds.length > 0) {
        const cityRepository = manager.getRepository(City);
        const cities = await cityRepository.find({
          where: { departmentId: In(departmentIds) },
          select: { id: true },
        });
        const cityIds = cities.map(({ id: cityId }) => cityId);

        if (cityIds.length > 0) {
          const cinemaRepository = manager.getRepository(Cinemas);
          const cinemas = await cinemaRepository.find({
            where: { cityId: In(cityIds) },
            select: { id: true },
          });
          const cinemaIds = cinemas.map(({ id: cinemaId }) => Number(cinemaId));

          if (cinemaIds.length > 0) {
            const roomRepository = manager.getRepository(Room);
            const rooms = await roomRepository.find({
              where: { cinemaId: In(cinemaIds) },
              select: { id: true },
            });
            const roomIds = rooms.map(({ id: roomId }) => roomId);

            if (roomIds.length > 0) {
              const rowRepository = manager.getRepository(Row);
              const rows = await rowRepository.find({
                where: { roomId: In(roomIds) },
                select: { id: true },
              });
              const rowIds = rows.map(({ id: rowId }) => rowId);

              if (rowIds.length > 0) {
                await manager.getRepository(Seat).update(
                  { rowId: In(rowIds) },
                  { isActive: false }
                );
                await rowRepository.update({ id: In(rowIds) }, { isActive: false });
              }
            }

            await roomRepository.update({ cinemaId: In(cinemaIds) }, { isActive: false });
          }

          await manager.getRepository(Cinemas).update(
            { cityId: In(cityIds) },
            { isActive: false }
          );
        }

        await cityRepository.update({ departmentId: In(departmentIds) }, { isActive: false });
      }

      await departmentRepository.update({ countryId: id }, { isActive: false });
      await manager.getRepository(Country).update(id, { isActive: false });
    });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
