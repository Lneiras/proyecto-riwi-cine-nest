import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityController } from "../controllers/city.controller.js";
import { CityDao } from "../dao/city.dao.js";
import { City } from "../entities/city.entity.js";
import { CityService } from "../services/city.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  controllers: [CityController],
  providers: [CityDao, CityService],
})
export class CityModule {}
