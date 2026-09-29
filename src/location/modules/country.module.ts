import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CountryController } from "../controllers/country.controller.js";
import { CountryDao } from "../dao/country.dao.js";
import { Country } from "../entities/country.entity.js";
import { CountryService } from "../services/country.service.js";
import { CountryExists } from "../guards/country.guard.js";

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [CountryController],
  providers: [CountryDao, CountryService, CountryExists],
  exports: [CountryService, CountryExists],
})
export class CountryModule {}
