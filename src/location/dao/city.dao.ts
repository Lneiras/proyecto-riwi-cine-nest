import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, In, Repository } from "typeorm";
import { UpdateCityDto, CreateCityDto } from "../dto/city.dto.js";
import { City } from "../entities/city.entity.js";
import { Cinemas } from "../../cinema/entities/cinemas.entity.js";
import { Room } from "../../cinema/entities/room.entity.js";
import { Row } from "../../cinema/entities/row.entity.js";
import { Seat } from "../../cinema/entities/seats.entity.js";

@Injectable()
export class CityDao {
  constructor(
    @InjectRepository(City) private readonly repository: Repository<City>,
    private readonly dataSource: DataSource
  ) {}

  async create(dto: CreateCityDto): Promise<City> {
    return this.repository.save(this.repository.create(dto));
  }

  async findAll(): Promise<City[]> {
    return this.repository.find({ where: { isActive: true }});
  }

  async findByDepartmentId(departmentId: number): Promise<City[]> {
    return this.repository.find({ where: { departmentId, isActive: true }, order: { name: "ASC" } });
  }

  async findOne(id: number): Promise<City | null> {
    return this.repository.findOne({ where: { id, isActive: true }});
  }

  async findOneByName(name: string): Promise<City | null> {
    return this.repository.findOne({ where: { name: ILike(name), isActive: true }});
  }

  async findOneByNameAndDepartmentId(name: string, departmentId: number): Promise<City | null> {
    return this.repository.findOne({
      where: { name: ILike(name), departmentId, isActive: true },
    });
  }

  async update(id: number, dto: UpdateCityDto): Promise<City | null> {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const cinemaRepository = manager.getRepository(Cinemas);
      const cinemas = await cinemaRepository.find({
        where: { cityId: id },
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

      await cinemaRepository.update({ cityId: id }, { isActive: false });
      await manager.getRepository(City).update(id, { isActive: false });
    });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
