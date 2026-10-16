import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Movie } from "../entities/movie.entity.js";
import { MoviesDao } from "../dao/movies.dao.js";
import { MoviesService } from "../services/movies.service.js";
import { MoviesController } from "../controllers/movies.controller.js";

// Módulo del subdominio Películas.
// forFeature registra Movie y permite inyectar su Repository en el DAO.
@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MoviesController],
  providers: [MoviesDao, MoviesService],
})
export class MoviesModule {}
