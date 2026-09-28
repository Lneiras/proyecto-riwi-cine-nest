import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { RoomService } from "../services/room.service.js";
import { ReqCreateRoomDto, ReqUpdateRoomDto } from "../dto/room.dto.js";
import { Room } from "../entities/room.entity.js";

@Controller('cinemas/:cinemaName/rooms')
export class RoomController {
  constructor(private readonly service: RoomService) {}

  @Post()
  create(@Param('cinemaName') cinemaName: string, @Body() dto: ReqCreateRoomDto): Promise<Room> {
    return this.service.create({ ...dto, cinemaName });
  }

  @Get()
  findAll(@Param('cinemaName') cinemaName: string): Promise<Room[] | null> {
    return this.service.findByCinemaName(cinemaName);
  }

  @Get(':roomNumber')
  findOne(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number): Promise<Room> {
    return this.service.findByNumberInCinema(roomNumber, cinemaName);
  }

  @Patch(':roomNumber')
  update(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number, @Body() dto: ReqUpdateRoomDto): Promise<Room | null> {
    return this.service.updateInCinema(roomNumber, cinemaName, dto);
  }

  @Delete(':roomNumber/soft-delete')
  softDelete(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number): Promise<void> {
    return this.service.softDeleteInCinema(roomNumber, cinemaName);
  }

  @Delete(':roomNumber')
  delete(@Param('cinemaName') cinemaName: string, @Param('roomNumber', ParseIntPipe) roomNumber: number): Promise<void> {
    return this.service.deleteInCinema(roomNumber, cinemaName);
  }
}
