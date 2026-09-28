import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { RowService } from "../services/row.service.js";
import { ReqCreateRowDto, ReqUpdateRowDto } from "../dto/row.dto.js";
import { Row } from "../entities/row.entity.js";

@Controller('cinemas/:cinemaName/rooms/:roomNumber/rows')
export class RowController {
  constructor(private readonly service: RowService) {}

  @Post()
  create(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Body() dto: ReqCreateRowDto): Promise<Row> {
    return this.service.createInRoom(dto, roomNumber, cinemaName);
  }

  @Get()
  findAll(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number): Promise<Row[]> {
    return this.service.findByRoomInCinema(roomNumber, cinemaName);
  }

  @Get(':rowLetter')
  findOne(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string): Promise<Row> {
    return this.service.findByLetterInRoom(rowLetter, roomNumber, cinemaName);
  }

  @Patch(':rowLetter')
  update(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string, @Body() dto: ReqUpdateRowDto): Promise<Row | null> {
    return this.service.updateInRoom(rowLetter, roomNumber, cinemaName, dto);
  }

  @Delete(':rowLetter/soft-delete')
  softDelete(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string): Promise<void> {
    return this.service.softDeleteInRoom(rowLetter, roomNumber, cinemaName);
  }

  @Delete(':rowLetter')
  delete(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string): Promise<void> {
    return this.service.deleteInRoom(rowLetter, roomNumber, cinemaName);
  }
}
