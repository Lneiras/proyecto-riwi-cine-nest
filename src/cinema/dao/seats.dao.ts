import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seat } from "../entities/seats.entity.js";
import { CreateSeatsDto, UpdateSeatsDto } from "../dto/seats.dto.js";


@Injectable()
export class SeatsDao{
    constructor(
        @InjectRepository(Seat) private readonly repository: Repository<Seat>
    ){}

    async findAll(): Promise<Seat[]> {
        return this.repository.find({ where: { isActive: true }});
    }

    async create(dto: CreateSeatsDto): Promise<Seat> {
        const newSeat = this.repository.create(dto)
        return await this.repository.save(newSeat)
    }

    async findAllByRowId(idRow: number): Promise<Seat[] | null>{
        return await this.repository.find({
            where: { rowId: idRow, isActive: true },
            select: {
                id: true,
                number: true,
                isPreferential: true
            }
        })
    }

    async findAllByRoomId(idRoom: number): Promise<Seat[] | null>{
        return await this.repository.find({
            where: { 
                isActive: true,
                row: {
                    isActive: true,
                    room: {
                        isActive: true,
                        id: idRoom
                    }
                }
            },
            select: {
                id: true,
                number: true,
                isPreferential: true,
                row: {
                    letter: true
                }
            }
        })
    }

    async findOneByIdAndRoom(id:number, idRoom:number): Promise<Seat | null>{
        return await this.repository.findOne({
            where:{
                id,
                isActive: true,
                row: {
                    isActive: true,
                    roomId: idRoom
                }
            },
            select: {
                id: true,
                number: true,
                isPreferential: true,
                row: {
                    letter: true
                }
            }
        })
    }

    async findOneByNumber(number: number): Promise<Seat | null> {
        return this.repository.findOne({ where: { number, isActive: true }});
    }

    async findOneByNumberAndRowId(number: number, rowId: number): Promise<Seat | null> {
        return this.repository.findOne({
            where: { number, rowId, isActive: true },
        });
    }

    async findOne(id:number): Promise<Seat | null>{
        return await this.repository.findOne({ where: { id, isActive: true }})
    }
 
    async update(id:number, dto: UpdateSeatsDto): Promise<Seat | null>{
        await this.repository.update(id, dto)
        return this.findOne(id)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.update(id, { isActive: false });
    }

    async delete(id: number): Promise<void>{
        await this.repository.delete(id)
    }
}