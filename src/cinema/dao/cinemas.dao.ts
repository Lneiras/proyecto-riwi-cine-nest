import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cinemas } from "../entities/cinemas.entity.js";
import { DataSource, ILike, In, Repository } from "typeorm";
import {  CreateCinemaDto, UpdateCinemaDto } from "../dto/cinemas.dto.js";
import { Room } from "../entities/room.entity.js";
import { Row } from "../entities/row.entity.js";
import { Seat } from "../entities/seats.entity.js";



@Injectable()
export class CinemasDao {
    constructor(
        @InjectRepository(Cinemas) private readonly repository: Repository<Cinemas>,
        private readonly dataSource: DataSource
    ) {}

    async create(dto: CreateCinemaDto): Promise<Cinemas> {
        const newCinema = this.repository.create(dto);
        const cinemaSaved = await this.repository.save(newCinema);
        return cinemaSaved
    }

    async findAll(): Promise<Cinemas[]>{
        return this.repository.find({ where: { isActive: true } as any })
    }

    async findOne(id: number): Promise<Cinemas | null>{
        return this.repository.findOne({ where: { id, isActive: true } as any })
    }

    async findOneByName(name: string): Promise<Cinemas | null>{
        return this.repository.findOne({ where: { name: ILike(name), isActive: true } as any })
    }

    async findOneByNameAndCityId(name: string, cityId: number): Promise<Cinemas | null> {
        return this.repository.findOne({
            where: { name: ILike(name), cityId, isActive: true } as any,
        });
    }

    async update(id: number, dto: UpdateCinemaDto): Promise<Cinemas | null> {
        await this.repository.update(id, dto)
        return this.findOne(id)
    }

    async softDelete(id: number): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const roomRepository = manager.getRepository(Room);
            const rooms = await roomRepository.find({
                where: { cinemaId: id },
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

            await roomRepository.update({ cinemaId: id }, { isActive: false });
            await manager.getRepository(Cinemas).update(id, { isActive: false });
        });
    }

    async delete(id: number): Promise<void>{
        await this.repository.delete(id)
    }

    async findByCityName(cityName: string): Promise<Cinemas[]>{
        return await this.repository.find({ 
            where:{ city: {
                name: ILike(cityName),
                isActive: true
            }, isActive: true },
            relations:{
                city: true
            },
            select:{
                id: true,
                name: true,
            }
        })
    }

    async findByCityId(cityId: number): Promise<Cinemas[]> {
        return this.repository.find({
            where: { cityId, isActive: true },
            select: { id: true, name: true },
        });
    }
}
