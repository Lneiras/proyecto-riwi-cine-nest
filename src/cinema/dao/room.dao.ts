import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "../entities/room.entity.js";
import { DataSource, In, Repository } from "typeorm";
import { CreateRoomDto, UpdateRoomDto } from "../dto/room.dto.js";
import { Row } from "../entities/row.entity.js";
import { Seat } from "../entities/seats.entity.js";

@Injectable()
export class RoomDao {
    constructor(
        @InjectRepository(Room) private readonly repository: Repository<Room>,
        private readonly dataSource: DataSource
    ){}

    async create(dto: CreateRoomDto): Promise<Room>{
        const newRoom = await this.repository.create(dto);
        return this.repository.save(newRoom);
    }

    async findAll(): Promise<Room[]> {
        return await this.repository.find({ where: { isActive: true } as any })
    }

    async findOneByNumber(number: number): Promise<Room | null> {
        return this.repository.findOne({ where: { number, isActive: true } as any });
    }

    async findOneByNumberAndCinemaId(number: number, cinemaId: number): Promise<Room | null> {
        return this.repository.findOne({
            where: { number, cinemaId, isActive: true } as any,
        });
    }

    async findOne(id: number): Promise<Room|null>{
        return await this.repository.findOne({ where: { id, isActive: true } as any })
    }

    async findByCinemaId(idCinema: number): Promise<Room[]|null>{
        return await this.repository.find({
            where: { cinemaId: idCinema, isActive: true },
            select:{
                id: true,
                number: true,
            }
        })
    }

    async update(id: number, dto: UpdateRoomDto): Promise<Room | null>{
        await this.repository.update(id, dto)
        return this.findOne(id)
    }

    async softDelete(id: number): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const rowRepository = manager.getRepository(Row);
            const rows = await rowRepository.find({
                where: { roomId: id },
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

            await manager.getRepository(Room).update(id, { isActive: false });
        });
    }

    async delete(id: number): Promise<void>{
        await this.repository.delete(id)
    }
}