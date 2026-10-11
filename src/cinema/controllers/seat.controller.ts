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
import { SeatService } from "../services/seat.service.js";
import { ReqCreateSeatsDto, ReqUpdateSeatsDto } from "../dto/seats.dto.js";
import { Seat } from "../entities/seats.entity.js";

@ApiTags("Cinemas")
@Controller("cinemas/:cinemaName/rooms/:roomNumber/rows/:rowLetter/seats")
export class SeatController {
  constructor(private readonly service: SeatService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo asiento en una fila de una sala" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  create(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
    @Body() dto: ReqCreateSeatsDto,
  ): Promise<Seat> {
    return this.service.createInRow(dto, rowLetter, roomNumber, cinemaName);
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de asientos de una fila" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  findAll(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
  ): Promise<Seat[] | null> {
    return this.service.findByRowInRoom(rowLetter, roomNumber, cinemaName);
  }

  @Get(":seatNumber")
  @ApiOperation({ summary: "Obtener un asiento por su número en una fila" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  @ApiParam({ name: "seatNumber", description: "Número del asiento", example: 5 })
  findOne(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
    @Param("seatNumber", ParseIntPipe) seatNumber: number,
  ): Promise<Seat> {
    return this.service.findByNumberInRow(seatNumber, rowLetter, roomNumber, cinemaName);
  }

  @Patch(":seatNumber")
  @ApiOperation({ summary: "Actualizar datos de un asiento en una fila" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  @ApiParam({ name: "seatNumber", description: "Número actual del asiento", example: 5 })
  update(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
    @Param("seatNumber", ParseIntPipe) seatNumber: number,
    @Body() dto: ReqUpdateSeatsDto,
  ): Promise<Seat | null> {
    return this.service.updateInRow(seatNumber, rowLetter, roomNumber, cinemaName, dto);
  }

  @Delete(":seatNumber/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar un asiento de forma lógica (soft-delete)" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  @ApiParam({ name: "seatNumber", description: "Número del asiento", example: 5 })
  softDelete(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
    @Param("seatNumber", ParseIntPipe) seatNumber: number,
  ): Promise<void> {
    return this.service.softDeleteInRow(seatNumber, rowLetter, roomNumber, cinemaName);
  }

  @Delete(":seatNumber")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente un asiento en una fila" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  @ApiParam({ name: "seatNumber", description: "Número del asiento", example: 5 })
  delete(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
    @Param("seatNumber", ParseIntPipe) seatNumber: number,
  ): Promise<void> {
    return this.service.deleteInRow(seatNumber, rowLetter, roomNumber, cinemaName);
  }
}
