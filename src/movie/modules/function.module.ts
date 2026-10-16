import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MovieFunction } from "../entities/function.entity.js";

// Módulo del subdominio Funciones.
// Por ahora solo registra la entidad con forFeature para que TypeORM la
// conozca (autoLoadEntities). En la Task 2 se agregan DAO, service y controller.
@Module({
  imports: [TypeOrmModule.forFeature([MovieFunction])],
})
export class FunctionModule {}
