import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CinemasModule } from "../cinema/modules/cinemas.module.js";
import { RoomModule } from "../cinema/modules/room.module.js";
import { CityModule } from "../location/modules/city.module.js";
import { MovieDao } from "./dao/movie.dao.js";
import { ShowtimeDao } from "./dao/showtime.dao.js";
import { Movie } from "./entities/movie.entity.js";
import { Showtime } from "./entities/showtime.entity.js";
import { MoviesController } from "./movies.controller.js";
import { MoviesService } from "./movies.service.js";
import { ShowtimesController } from "./showtimes.controller.js";
import { ShowtimesService } from "./showtimes.service.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Showtime]),
    CityModule,
    CinemasModule,
    RoomModule,
  ],
  controllers: [MoviesController, ShowtimesController],
  providers: [MovieDao, ShowtimeDao, MoviesService, ShowtimesService],
  exports: [MoviesService],
})
export class MoviesModule {}
