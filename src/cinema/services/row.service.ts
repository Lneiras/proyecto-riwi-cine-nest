import { Injectable, NotFoundException } from "@nestjs/common";
import { RowDao } from "../dao/row.dao.js";
import { RoomService } from "./room.service.js";
import { ReqCreateRowDto, ReqUpdateRowDto, CreateRowDto, UpdateRowDto } from "../dto/row.dto.js";
import { Row } from "../entities/row.entity.js";

@Injectable()
export class RowService {
    constructor(
        private readonly dao: RowDao,
        private readonly roomService: RoomService
    ) {}

    private async resolveRoomId(roomNumber: number): Promise<number> {
        const room = await this.roomService.findByNumber(roomNumber);
        return Number(room.id);
    }

    async create(dto: ReqCreateRowDto): Promise<Row> {
        if (dto.roomNumber === undefined) throw new NotFoundException("Room number is required");
        const roomId = await this.resolveRoomId(dto.roomNumber);
        const daoDto: CreateRowDto = { letter: dto.letter.trim().toUpperCase(), isVip: dto.isVip, roomId };
        return this.dao.create(daoDto);
    }

    async createInRoom(dto: ReqCreateRowDto, roomNumber: number, cinemaName: string): Promise<Row> {
        const room = await this.roomService.findByNumberInCinema(roomNumber, cinemaName);
        return this.dao.create({ letter: dto.letter.trim().toUpperCase(), isVip: dto.isVip, roomId: room.id });
    }

    async findAll(): Promise<Row[] | null> {
        return this.dao.findAll();
    }

    async findByLetter(letter: string): Promise<Row> {
        const item = await this.dao.findOneByLetter(letter.trim().toUpperCase());
        if (!item) throw new NotFoundException("Row not found");
        return item;
    }

    async findByLetterInRoom(
        letter: string,
        roomNumber: number,
        cinemaName: string
    ): Promise<Row> {
        const room = await this.roomService.findByNumberInCinema(roomNumber, cinemaName);
        const item = await this.dao.findOneByLetterAndRoomId(
            letter.trim().toUpperCase(),
            room.id
        );
        if (!item) throw new NotFoundException("Row not found in room");
        return item;
    }

    async findByRoomNumber(roomNumber: number): Promise<Row[]> {
        const roomId = await this.resolveRoomId(roomNumber);
        return this.dao.findAllByRoomId(roomId);
    }

    async findByRoomInCinema(roomNumber: number, cinemaName: string): Promise<Row[]> {
        const room = await this.roomService.findByNumberInCinema(roomNumber, cinemaName);
        return this.dao.findAllByRoomId(room.id);
    }

    async update(letter: string, dto: ReqUpdateRowDto): Promise<Row | null> {
        const item = await this.findByLetter(letter);
        const daoDto: UpdateRowDto = {
            letter: dto.letter?.trim().toUpperCase(),
            isVip: dto.isVip,
        };
        if (dto.roomNumber !== undefined) {
            daoDto.roomId = await this.resolveRoomId(dto.roomNumber);
        }
        return this.dao.update(item.id, daoDto);
    }

    async updateInRoom(letter: string, roomNumber: number, cinemaName: string, dto: ReqUpdateRowDto): Promise<Row | null> {
        const row = await this.findByLetterInRoom(letter, roomNumber, cinemaName);
        return this.dao.update(row.id, { letter: dto.letter?.trim().toUpperCase(), isVip: dto.isVip });
    }

    async softDelete(letter: string): Promise<void> {
        const item = await this.findByLetter(letter);
        return this.dao.softDelete(item.id);
    }

    async softDeleteInRoom(letter: string, roomNumber: number, cinemaName: string): Promise<void> {
        const row = await this.findByLetterInRoom(letter, roomNumber, cinemaName);
        return this.dao.softDelete(row.id);
    }

    async delete(letter: string): Promise<void> {
        const item = await this.findByLetter(letter);
        return this.dao.delete(item.id);
    }

    async deleteInRoom(letter: string, roomNumber: number, cinemaName: string): Promise<void> {
        const row = await this.findByLetterInRoom(letter, roomNumber, cinemaName);
        return this.dao.delete(row.id);
    }
}
