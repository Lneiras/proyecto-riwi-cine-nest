import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Movie } from "../entities/movie.entity.js";

// Módulo del subdominio Películas.
// Por ahora solo registra la entidad con forFeature para que TypeORM la
// conozca (autoLoadEntities). En la Task 2 se agregan DAO, service y controller.
@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
})
export class MoviesModule {}
