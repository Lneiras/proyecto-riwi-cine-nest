import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Row } from "../entities/row.entity.js";
import { DataSource, Repository } from "typeorm";
import { CreateRowDto, UpdateRowDto } from "../dto/row.dto.js";
import { Seat } from "../entities/seats.entity.js";

@Injectable()
export class RowDao {
    constructor(
        @InjectRepository(Row) private readonly repository: Repository<Row>,
        private readonly dataSource: DataSource
    ){}

    async create(dto: CreateRowDto): Promise<Row>{
        const newRow = this.repository.create(dto)
        return await this.repository.save(newRow)
    }

    async findAll(): Promise<Row[]|null>{
        return await this.repository.find({ where: { isActive: true } as any })
    }

    async findOneByLetter(letter: string): Promise<Row | null> {
        return this.repository.findOne({ where: { letter, isActive: true } as any });
    }

    async findOneByLetterAndRoomId(letter: string, roomId: number): Promise<Row | null> {
        return this.repository.findOne({
            where: { letter, roomId, isActive: true } as any,
        });
    }

    async findOne(id: number): Promise<Row|null>{
        return this.repository.findOne({ where: { id, isActive: true } as any })
    }

    async findAllByRoomId(idRoom: number): Promise<Row[]>{
        return await this.repository.find({
            where: { roomId: idRoom, isActive: true },
            select: {
                id: true,
                letter: true,
                isVip: true
            }
        })
    }

    async update(id: number, dto: UpdateRowDto): Promise<Row|null> {
        await this.repository.update(id, dto)
        return this.findOne(id)
    }

    async softDelete(id: number): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            await manager.getRepository(Seat).update({ rowId: id }, { isActive: false });
            await manager.getRepository(Row).update(id, { isActive: false });
        });
    }

    async delete(id: number): Promise<void>{
        await this.repository.delete(id)
    }
}