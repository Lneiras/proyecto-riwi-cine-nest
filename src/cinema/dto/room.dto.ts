import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { typeRoom } from "../entities/room.entity.js";

/** Lo que el frontend envía */
export class ReqCreateRoomDto {
    @IsNumber()
    number: number;

    @IsEnum(typeRoom)
    type: typeRoom;

    @IsOptional()
    @IsString()
    cinemaName?: string;
}

export class ReqUpdateRoomDto {
    @IsOptional()
    @IsNumber()
    number?: number;

    @IsOptional()
    @IsEnum(typeRoom)
    type?: typeRoom;

    @IsOptional()
    @IsString()
    cinemaName?: string; // frontend manda nombre, no id
}

/** Uso interno (dao) */
export class CreateRoomDto {
    @IsNumber()
    number: number;

    @IsEnum(typeRoom)
    type: typeRoom;

    @IsNumber()
    cinemaId: number;
}

export class UpdateRoomDto {
    @IsOptional()
    @IsNumber()
    number?: number;

    @IsOptional()
    @IsEnum(typeRoom)
    type?: typeRoom;

    @IsOptional()
    @IsNumber()
    cinemaId?: number;
}
