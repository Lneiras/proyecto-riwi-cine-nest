import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from "typeorm";
import { Movie } from "./movie.entity.js";
import { Format } from "./format.entity.js";
import { Showtime } from "./showtime.entity.js";
import { Room } from "../../cinema/entities/room.entity.js";

// Idioma en el que se proyecta la función.
export enum FunctionLanguage {
  DOBLADA = "DOBLADA",
  SUBTITULADA = "SUBTITULADA",
}

// Tabla "functions": una función es UNA proyección concreta.
// Ejemplo: "Dune, en la Sala 3, formato IMAX, subtitulada, el 2026-10-15
// a las 19:00, con precio base de $18.000".
//
// La clase se llama MovieFunction (y no Function) porque "Function" ya es
// un objeto global de JavaScript y no debemos taparlo.
//
// ¿Y la ciudad y el complejo? Se llega a ellos por la sala:
// functions.room_id -> room.cinema_id (complejo) -> cinemas.cityId (ciudad).
// Así no repetimos datos que podrían quedar inconsistentes.
@Entity("functions")
// Regla de integridad: una sala no puede tener dos funciones
// el mismo día en el mismo horario.
@Unique(["roomId", "functionDate", "showtimeId"])
// Índices (HU-003 Task 3): aceleran las búsquedas más frecuentes.
// - function_date: la cartelera siempre filtra por un rango de fechas.
// - movie_id: unir películas con sus funciones (y HU-004: funciones de una película).
// PostgreSQL NO crea índices automáticos para las llaves foráneas.
@Index("IDX_functions_function_date", ["functionDate"])
@Index("IDX_functions_movie_id", ["movieId"])
export class MovieFunction {
  @PrimaryGeneratedColumn()
  id: number;

  // type "date" guarda solo el día. TypeORM lo devuelve como string "YYYY-MM-DD".
  @Column({ name: "function_date", type: "date" })
  functionDate: string;

  // Precio base de la boleta (ej. 18000.00).
  // Para dinero usamos "decimal" (exacto) y no "float" (puede redondear mal).
  // PostgreSQL devuelve los decimal como texto ("18000.00"), por eso el
  // transformer lo convierte a number al leer.
  @Column({
    name: "base_price",
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  basePrice: number;

  @Column({ type: "enum", enum: FunctionLanguage })
  language: FunctionLanguage;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  // ---------- RELACIONES (todas son "muchas funciones -> uno") ----------
  // Para cada relación tenemos dos propiedades:
  //  - la columna con el id (ej. movieId), útil para filtrar y guardar.
  //  - el objeto relacionado (ej. movie), útil para hacer joins.
  // onDelete "RESTRICT": no se puede borrar una película, sala, formato u
  // horario si todavía tiene funciones asociadas.
  //
  // Usamos Relation<...> porque el proyecto es ESM y Movie <-> MovieFunction
  // se importan entre sí (import circular). Relation evita el error
  // "Cannot access 'Movie' before initialization".

  @Column({ name: "movie_id", type: "int" })
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.functions, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "movie_id" })
  movie: Relation<Movie>;

  @Column({ name: "room_id", type: "int" })
  roomId: number;

  @ManyToOne(() => Room, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "room_id" })
  room: Relation<Room>;

  @Column({ name: "format_id", type: "int" })
  formatId: number;

  @ManyToOne(() => Format, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "format_id" })
  format: Relation<Format>;

  @Column({ name: "showtime_id", type: "int" })
  showtimeId: number;

  @ManyToOne(() => Showtime, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "showtime_id" })
  showtime: Relation<Showtime>;
}
