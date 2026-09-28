import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Room } from "../entities/room.entity.js";
import { RoomDao } from "../dao/room.dao.js";
import { RoomService } from "../services/room.service.js";
import { RoomController } from "../controllers/room.controller.js";
import { CinemasModule } from "./cinemas.module.js";

@Module({
    imports: [TypeOrmModule.forFeature([Room]), CinemasModule],
    controllers: [RoomController],
    providers: [RoomDao, RoomService],
    exports: [RoomService],
})
export class RoomModule {}
