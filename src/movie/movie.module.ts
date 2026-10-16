import { Module } from "@nestjs/common";
import { MoviesModule } from "./modules/movies.module.js";
import { FormatModule } from "./modules/format.module.js";
import { ShowtimeModule } from "./modules/showtime.module.js";
import { FunctionModule } from "./modules/function.module.js";

// Módulo agregador del dominio "movie" (cartelera).
// Igual que CinemaModule o LocationModule: solo agrupa los módulos
// de cada subdominio para importarlos de una sola vez en AppModule.
@Module({
  imports: [MoviesModule, FormatModule, ShowtimeModule, FunctionModule],
})
export class MovieModule {}
