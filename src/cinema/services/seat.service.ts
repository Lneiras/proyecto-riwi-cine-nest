import { Injectable, NotFoundException } from "@nestjs/common";
import { SeatsDao } from "../dao/seats.dao.js";
import { RowService } from "./row.service.js";
import { ReqCreateSeatsDto, ReqUpdateSeatsDto, CreateSeatsDto, UpdateSeatsDto } from "../dto/seats.dto.js";
import { Seat } from "../entities/seats.entity.js";

@Injectable()
export class SeatService {
    constructor(
        private readonly dao: SeatsDao,
        private readonly rowService: RowService
    ) {}

    private async resolveRowId(rowLetter: string): Promise<number> {
        const row = await this.rowService.findByLetter(rowLetter);
        return Number(row.id);
    }

    async create(dto: ReqCreateSeatsDto): Promise<Seat> {
        if (!dto.rowLetter) throw new NotFoundException("Row letter is required");
        const rowId = await this.resolveRowId(dto.rowLetter);
        const daoDto: CreateSeatsDto = { number: dto.number, isPreferential: dto.isPreferential, rowId };
        return this.dao.create(daoDto);
    }

    async createInRow(dto: ReqCreateSeatsDto, rowLetter: string, roomNumber: number, cinemaName: string): Promise<Seat> {
        const row = await this.rowService.findByLetterInRoom(rowLetter, roomNumber, cinemaName);
        return this.dao.create({ number: dto.number, isPreferential: dto.isPreferential, rowId: row.id });
    }

    async findAll(): Promise<Seat[] | null> {
        return this.dao.findAll();
    }

    async findByNumber(number: number): Promise<Seat> {
        const item = await this.dao.findOneByNumber(number);
        if (!item) throw new NotFoundException("Seat not found");
        return item;
    }

    async findByNumberInRow(
        number: number,
        rowLetter: string,
        roomNumber: number,
        cinemaName: string
    ): Promise<Seat> {
        const row = await this.rowService.findByLetterInRoom(
            rowLetter,
            roomNumber,
            cinemaName
        );
        const item = await this.dao.findOneByNumberAndRowId(number, row.id);
        if (!item) throw new NotFoundException("Seat not found in row");
        return item;
    }

    async findByRowLetter(rowLetter: string): Promise<Seat[] | null> {
        const rowId = await this.resolveRowId(rowLetter);
        return this.dao.findAllByRowId(rowId);
    }

    async findByRowInRoom(
        rowLetter: string,
        roomNumber: number,
        cinemaName: string
    ): Promise<Seat[] | null> {
        const row = await this.rowService.findByLetterInRoom(
            rowLetter,
            roomNumber,
            cinemaName
        );
        return this.dao.findAllByRowId(row.id);
    }

    async update(number: number, dto: ReqUpdateSeatsDto): Promise<Seat | null> {
        const item = await this.findByNumber(number);
        const daoDto: UpdateSeatsDto = { number: dto.number, isPreferential: dto.isPreferential };
        if (dto.rowLetter) {
            daoDto.rowId = await this.resolveRowId(dto.rowLetter);
        }
        return this.dao.update(item.id, daoDto);
    }

    async updateInRow(number: number, rowLetter: string, roomNumber: number, cinemaName: string, dto: ReqUpdateSeatsDto): Promise<Seat | null> {
        const seat = await this.findByNumberInRow(number, rowLetter, roomNumber, cinemaName);
        return this.dao.update(seat.id, { number: dto.number, isPreferential: dto.isPreferential });
    }

    async softDelete(number: number): Promise<void> {
        const item = await this.findByNumber(number);
        return this.dao.softDelete(item.id);
    }

    async softDeleteInRow(number: number, rowLetter: string, roomNumber: number, cinemaName: string): Promise<void> {
        const seat = await this.findByNumberInRow(number, rowLetter, roomNumber, cinemaName);
        return this.dao.softDelete(seat.id);
    }

    async delete(number: number): Promise<void> {
        const item = await this.findByNumber(number);
        return this.dao.delete(item.id);
    }

    async deleteInRow(number: number, rowLetter: string, roomNumber: number, cinemaName: string): Promise<void> {
        const seat = await this.findByNumberInRow(number, rowLetter, roomNumber, cinemaName);
        return this.dao.delete(seat.id);
    }
}
