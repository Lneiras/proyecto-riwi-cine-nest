import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Format } from "../entities/format.entity.js";

// Módulo del subdominio Formatos de proyección.
// Por ahora solo registra la entidad con forFeature para que TypeORM la
// conozca (autoLoadEntities). En la Task 2 se agregan DAO, service y controller.
@Module({
  imports: [TypeOrmModule.forFeature([Format])],
})
export class FormatModule {}
