import {
  Column,
  Entity,
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

// La clase se llama MovieFunction (y no Function) porque "Function" ya es
// un objeto global de JavaScript y no debemos taparlo.

@Entity("functions")
// Regla de integridad: una sala no puede tener dos funciones
// el mismo día en el mismo horario.
@Unique(["roomId", "functionDate", "showtimeId"])
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
