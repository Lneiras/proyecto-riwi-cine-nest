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
import { RowService } from "../services/row.service.js";
import { ReqCreateRowDto, ReqUpdateRowDto } from "../dto/row.dto.js";
import { Row } from "../entities/row.entity.js";

@ApiTags("Cinemas")
@Controller("cinemas/:cinemaName/rooms/:roomNumber/rows")
export class RowController {
  constructor(private readonly service: RowService) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva fila en una sala de cine" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  create(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Body() dto: ReqCreateRowDto,
  ): Promise<Row> {
    return this.service.createInRoom(dto, roomNumber, cinemaName);
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de filas de una sala de cine" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  findAll(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
  ): Promise<Row[]> {
    return this.service.findByRoomInCinema(roomNumber, cinemaName);
  }

  @Get(":rowLetter")
  @ApiOperation({ summary: "Obtener una fila por su letra en una sala" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  findOne(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
  ): Promise<Row> {
    return this.service.findByLetterInRoom(rowLetter, roomNumber, cinemaName);
  }

  @Patch(":rowLetter")
  @ApiOperation({ summary: "Actualizar datos de una fila en una sala" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra actual de la fila", example: "A" })
  update(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
    @Body() dto: ReqUpdateRowDto,
  ): Promise<Row | null> {
    return this.service.updateInRoom(rowLetter, roomNumber, cinemaName, dto);
  }

  @Delete(":rowLetter/soft-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar una fila de forma lógica (soft-delete en cascada)" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  softDelete(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
  ): Promise<void> {
    return this.service.softDeleteInRoom(rowLetter, roomNumber, cinemaName);
  }

  @Delete(":rowLetter")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar físicamente una fila en una sala" })
  @ApiParam({ name: "cinemaName", description: "Nombre del cine", example: "Cine Colombia Santa Fe" })
  @ApiParam({ name: "roomNumber", description: "Número de sala", example: 1 })
  @ApiParam({ name: "rowLetter", description: "Letra de la fila", example: "A" })
  delete(
    @Param("cinemaName") cinemaName: string,
    @Param("roomNumber", ParseIntPipe) roomNumber: number,
    @Param("rowLetter") rowLetter: string,
  ): Promise<void> {
    return this.service.deleteInRoom(rowLetter, roomNumber, cinemaName);
  }
}
