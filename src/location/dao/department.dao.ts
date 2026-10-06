import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, In, Repository } from "typeorm";
import { CreateDepartmentDto, UpdateDepartmentDto} from "../dto/department.dto.js";
import { Department } from "../entities/department.entity.js";
import { City } from "../entities/city.entity.js";
import { Cinemas } from "../../cinema/entities/cinemas.entity.js";
import { Room } from "../../cinema/entities/room.entity.js";
import { Row } from "../../cinema/entities/row.entity.js";
import { Seat } from "../../cinema/entities/seats.entity.js";

@Injectable()
export class DepartmentDao {
  constructor(
    @InjectRepository(Department) private readonly repository: Repository<Department>,
    private readonly dataSource: DataSource
  ) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const newDepartment = this.repository.create(dto);
    return this.repository.save(newDepartment);
  }

  async findAll(): Promise<Department[]> {
    return this.repository.find({ where: { isActive: true } as any });
  }

  async findByCountryId(countryId: number): Promise<Department[]> {
    return this.repository.find({ where: { countryId, isActive: true } as any, order: { name: "ASC" } });
  }

  async findOne(id: number): Promise<Department | null> {
    return this.repository.findOne({ where: { id, isActive: true } as any });
  }

  async findOneByName(name: string): Promise<Department | null> {
    return this.repository.findOne({ where: { name: ILike(name), isActive: true } as any });
  }

  async findOneByNameAndCountryId(name: string, countryId: number): Promise<Department | null> {
    return this.repository.findOne({
      where: { name: ILike(name), countryId, isActive: true } as any,
    });
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<Department | null> {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const cityRepository = manager.getRepository(City);
      const cities = await cityRepository.find({
        where: { departmentId: id },
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

        await cinemaRepository.update({ cityId: In(cityIds) }, { isActive: false });
      }

      await cityRepository.update({ departmentId: id }, { isActive: false });
      await manager.getRepository(Department).update(id, { isActive: false });
    });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
