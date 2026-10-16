import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { Room } from "../../cinema/entities/room.entity.js";
import { Movie } from "./movie.entity.js";

export enum AudioType {
  DUBBED = "DUBBED",
  SUBTITLED = "SUBTITLED",
}

/**
 * Una función: una película proyectada en una sala, a una hora.
 * El formato (2D/3D/IMAX/4D) sale de `room.type`; el cine y la ciudad,
 * de `room.cinema` y `room.cinema.city`.
 */
@Entity("showtimes")
@Index(["movieId", "startsAt"])
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "movie_id", type: "int" })
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.showtimes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "movie_id" })
  movie: Relation<Movie>;

  @Column({ name: "room_id", type: "int" })
  roomId: number;

  @ManyToOne(() => Room, { onDelete: "CASCADE" })
  @JoinColumn({ name: "room_id" })
  room: Relation<Room>;

  @Column({ type: "varchar", length: 50 })
  language: string;

  @Column({ name: "audio_type", type: "varchar", length: 20 })
  audioType: AudioType;

  @Column({ name: "starts_at", type: "timestamptz" })
  startsAt: Date;

  /** Valor de la entrada; puede variar por formato, sala y horario (RN-037). */
  @Column({ type: "numeric", precision: 10, scale: 2 })
  price: string;

  /**
   * No existe todavía un sistema de reservas de sillas (HU-010/HU-011);
   * mientras tanto esta bandera permite marcar visualmente una función
   * agotada (RN-015).
   */
  @Column({ name: "sold_out", type: "boolean", default: false })
  soldOut: boolean;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;
}
