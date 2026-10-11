import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seat } from "../entities/seats.entity.js";
import { SeatsDao } from "../dao/seats.dao.js";
import { SeatService } from "../services/seat.service.js";
import { SeatController } from "../controllers/seat.controller.js";
import { RowModule } from "./row.module.js";

@Module({
    imports: [TypeOrmModule.forFeature([Seat]), RowModule],
    controllers: [SeatController],
    providers: [SeatsDao, SeatService],
    exports: [SeatService],
})
export class SeatModule {}
