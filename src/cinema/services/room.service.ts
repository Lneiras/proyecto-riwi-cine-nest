import { Injectable, NotFoundException } from "@nestjs/common";
import { RoomDao } from "../dao/room.dao.js";
import { CinemasService } from "./cinemas.service.js";
import { ReqCreateRoomDto, ReqUpdateRoomDto, CreateRoomDto, UpdateRoomDto } from "../dto/room.dto.js";
import { Room } from "../entities/room.entity.js";

@Injectable()
export class RoomService {
    constructor(
        private readonly dao: RoomDao,
        private readonly cinemasService: CinemasService
    ) {}

    private async resolveCinemaId(cinemaName: string): Promise<number> {
        const cinema = await this.cinemasService.findOneByName(cinemaName.trim().replace(/\s+/g, ' '));
        if (!cinema) throw new NotFoundException("Cinema not found");
        return Number(cinema.id);
    }

    async create(dto: ReqCreateRoomDto): Promise<Room> {
        if (!dto.cinemaName) throw new NotFoundException("Cinema name is required");
        const cinemaId = await this.resolveCinemaId(dto.cinemaName);
        const daoDto: CreateRoomDto = { number: dto.number, type: dto.type, cinemaId };
        return this.dao.create(daoDto);
    }

    async findAll(): Promise<Room[] | null> {
        return this.dao.findAll();
    }

    async findByNumber(number: number): Promise<Room> {
        const item = await this.dao.findOneByNumber(number);
        if (!item) throw new NotFoundException("Room not found");
        return item;
    }

    async findByNumberInCinema(number: number, cinemaName: string): Promise<Room> {
        const cinemaId = await this.resolveCinemaId(cinemaName);
        const item = await this.dao.findOneByNumberAndCinemaId(number, cinemaId);
        if (!item) throw new NotFoundException("Room not found in cinema");
        return item;
    }

    async findByCinemaName(cinemaName: string): Promise<Room[] | null> {
        const cinemaId = await this.resolveCinemaId(cinemaName);
        return this.dao.findByCinemaId(cinemaId);
    }

    async update(number: number, dto: ReqUpdateRoomDto): Promise<Room | null> {
        const item = await this.findByNumber(number);
        const daoDto: UpdateRoomDto = { number: dto.number, type: dto.type };
        if (dto.cinemaName) {
            daoDto.cinemaId = await this.resolveCinemaId(dto.cinemaName);
        }
        return this.dao.update(item.id, daoDto);
    }

    async updateInCinema(number: number, cinemaName: string, dto: ReqUpdateRoomDto): Promise<Room | null> {
        const room = await this.findByNumberInCinema(number, cinemaName);
        return this.dao.update(room.id, { number: dto.number, type: dto.type });
    }

    async softDelete(number: number): Promise<void> {
        const item = await this.findByNumber(number);
        return this.dao.softDelete(item.id);
    }

    async softDeleteInCinema(number: number, cinemaName: string): Promise<void> {
        const room = await this.findByNumberInCinema(number, cinemaName);
        return this.dao.softDelete(room.id);
    }

    async delete(number: number): Promise<void> {
        const item = await this.findByNumber(number);
        return this.dao.delete(item.id);
    }

    async deleteInCinema(number: number, cinemaName: string): Promise<void> {
        const room = await this.findByNumberInCinema(number, cinemaName);
        return this.dao.delete(room.id);
    }
}
