import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cinemas } from "../entities/cinemas.entity.js";
import { CinemasDao } from "../dao/cinemas.dao.js";
import { CinemasService } from "../services/cinemas.service.js";
import { CinemasController } from "../controllers/cinemas.controller.js";
import { CityExists } from "../guards/cinemas.guard.js";
import { CityModule } from "../../location/modules/city.module.js";

@Module({
    imports: [TypeOrmModule.forFeature([Cinemas]), CityModule],
    controllers: [CinemasController],
    providers: [CinemasDao, CinemasService, CityExists],
    exports: [CinemasService],
})
export class CinemasModule {}
