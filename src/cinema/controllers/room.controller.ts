import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { RoomService } from "../services/room.service.js";
import { ReqCreateRoomDto, ReqUpdateRoomDto } from "../dto/room.dto.js";
import { Room } from "../entities/room.entity.js";

@ApiTags("Cinemas")
@Controller("cinemas/:cinemaName/rooms")
export class RoomController {
  constructor(private readonly service: RoomService) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva sala en un cine" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  create(
    @Param("cinemaName") cinemaName: string,
    @Body() dto: ReqCreateRoomDto,
  ): Promise<Room> {
    return this.service.create({ ...dto, cinemaName });
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de salas de un cine" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  findAll(@Param("cinemaName") cinemaName: string): Promise<Room[] | null> {
    return this.service.findByCinemaName(cinemaName);
  }

  @Get(":roomNumber")
  @ApiOperation({ summary: "Obtener una sala por su número en un cine" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  findOne(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
  ): Promise<Room> {
    return this.service.findByNumberInCinema(roomNumber, cinemaName);
  }

  @Patch(":roomNumber")
  @ApiOperation({ summary: "Actualizar datos de una sala en un cine" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  update(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Body() dto: ReqUpdateRoomDto,
  ): Promise<Room | null> {
    return this.service.updateInCinema(roomNumber, cinemaName, dto);
  }

  @Delete(":roomNumber/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar una sala de forma lógica (soft-delete en cascada)" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  softDelete(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
  ): Promise<void> {
    return this.service.softDeleteInCinema(roomNumber, cinemaName);
  }

  @Delete(":roomNumber")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente una sala en un cine" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  delete(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
  ): Promise<void> {
    return this.service.deleteInCinema(roomNumber, cinemaName);
  }
}
