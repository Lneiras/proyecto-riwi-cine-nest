import { Module } from "@nestjs/common";
import { CinemasModule } from "./modules/cinemas.module.js";
import { RoomModule } from "./modules/room.module.js";
import { RowModule } from "./modules/row.module.js";
import { SeatModule } from "./modules/seat.module.js";

@Module({
    imports: [
        CinemasModule,
        RoomModule,
        RowModule,
        SeatModule
    ]
})
export class CinemaModule {}
