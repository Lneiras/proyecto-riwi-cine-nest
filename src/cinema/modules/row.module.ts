import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Row } from "../entities/row.entity.js";
import { RowDao } from "../dao/row.dao.js";
import { RowService } from "../services/row.service.js";
import { RowController } from "../controllers/row.controller.js";
import { RoomModule } from "./room.module.js";

@Module({
    imports: [TypeOrmModule.forFeature([Row]), RoomModule],
    controllers: [RowController],
    providers: [RowDao, RowService],
    exports: [RowService],
})
export class RowModule {}
