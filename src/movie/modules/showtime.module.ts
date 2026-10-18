import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Showtime } from "../entities/showtime.entity.js";

// Módulo del subdominio Horarios.
// Por ahora solo registra la entidad con forFeature para que TypeORM la
// conozca (autoLoadEntities). En la Task 2 se agregan DAO, service y controller.
@Module({
  imports: [TypeOrmModule.forFeature([Showtime])],
})
export class ShowtimeModule {}
