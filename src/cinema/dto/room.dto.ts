import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { typeRoom } from "../entities/room.entity.js";

/** Lo que el frontend envía */
export class ReqCreateRoomDto {
  @ApiProperty({
    description: "Número de sala",
    example: 1,
  })
  @IsNumber()
  number: number;

  @ApiProperty({
    description: "Tipo de formato de la sala",
    enum: typeRoom,
    example: typeRoom["2d"],
  })
  @IsEnum(typeRoom)
  type: typeRoom;

  @ApiPropertyOptional({
    description: "Nombre del cine al que pertenece la sala",
    example: "Cine Colombia Santa Fe",
  })
  @IsOptional()
  @IsString()
  cinemaName?: string;
}

export class ReqUpdateRoomDto {
  @ApiPropertyOptional({
    description: "Nuevo número de sala",
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  number?: number;

  @ApiPropertyOptional({
    description: "Nuevo tipo de formato de la sala",
    enum: typeRoom,
    example: typeRoom["3d"],
  })
  @IsOptional()
  @IsEnum(typeRoom)
  type?: typeRoom;

  @ApiPropertyOptional({
    description: "Nombre del cine al que pertenece la sala",
    example: "Cine Colombia Santa Fe",
  })
  @IsOptional()
  @IsString()
  cinemaName?: string;
}

/** Uso interno (dao) */
export class CreateRoomDto {
  @ApiProperty({
    description: "Número de sala",
    example: 1,
  })
  @IsNumber()
  number: number;

  @ApiProperty({
    description: "Tipo de formato de la sala",
    enum: typeRoom,
    example: typeRoom["2d"],
  })
  @IsEnum(typeRoom)
  type: typeRoom;

  @ApiProperty({
    description: "ID del cine",
    example: 1,
  })
  @IsNumber()
  cinemaId: number;
}

export class UpdateRoomDto {
  @ApiPropertyOptional({
    description: "Nuevo número de sala",
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  number?: number;

  @ApiPropertyOptional({
    description: "Nuevo tipo de formato de la sala",
    enum: typeRoom,
    example: typeRoom["3d"],
  })
  @IsOptional()
  @IsEnum(typeRoom)
  type?: typeRoom;

  @ApiPropertyOptional({
    description: "ID del cine",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  cinemaId?: number;
}
