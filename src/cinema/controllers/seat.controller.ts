import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { SeatService } from "../services/seat.service.js";
import { ReqCreateSeatsDto, ReqUpdateSeatsDto } from "../dto/seats.dto.js";
import { Seat } from "../entities/seats.entity.js";

@Controller('cinemas/:cinemaName/rooms/:roomNumber/rows/:rowLetter/seats')
export class SeatController {
  constructor(private readonly service: SeatService) {}

  @Post()
  create(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string, @Body() dto: ReqCreateSeatsDto): Promise<Seat> {
    return this.service.createInRow(dto, rowLetter, roomNumber, cinemaName);
  }

  @Get()
  findAll(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string): Promise<Seat[] | null> {
    return this.service.findByRowInRoom(rowLetter, roomNumber, cinemaName);
  }

  @Get(':seatNumber')
  findOne(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string, @Param('seatNumber', ParseIntPipe) seatNumber: number): Promise<Seat> {
    return this.service.findByNumberInRow(seatNumber, rowLetter, roomNumber, cinemaName);
  }

  @Patch(':seatNumber')
  update(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string, @Param('seatNumber', ParseIntPipe) seatNumber: number, @Body() dto: ReqUpdateSeatsDto): Promise<Seat | null> {
    return this.service.updateInRow(seatNumber, rowLetter, roomNumber, cinemaName, dto);
  }

  @Delete(':seatNumber/soft-delete')
  softDelete(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string, @Param('seatNumber', ParseIntPipe) seatNumber: number): Promise<void> {
    return this.service.softDeleteInRow(seatNumber, rowLetter, roomNumber, cinemaName);
  }

  @Delete(':seatNumber')
  delete(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Param('rowLetter') rowLetter: string, @Param('seatNumber', ParseIntPipe) seatNumber: number): Promise<void> {
    return this.service.deleteInRow(seatNumber, rowLetter, roomNumber, cinemaName);
  }
}
