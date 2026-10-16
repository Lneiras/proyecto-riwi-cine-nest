import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Showtime } from "./showtime.entity.js";

/**
 * Catálogo de películas. HU-004 (consulta de detalle) lee de aquí; los
 * horarios/precios/formatos/idiomas disponibles salen de sus Showtimes.
 */
@Entity("movies")
@Unique(["name"])
@Index(["rating"])
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ name: "duration_minutes", type: "int" })
  durationMinutes: number;

  /** Clasificación por edades, ej. "PG-13". */
  @Column({ type: "varchar", length: 10 })
  rating: string;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  genres: string[];

  @Column({ type: "text", nullable: true })
  synopsis: string | null;

  @Column({ type: "varchar", length: 150, nullable: true })
  director: string | null;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  actors: string[];

  @Column({ name: "release_date", type: "date", nullable: true })
  releaseDate: Date | string | null;

  @Column({ name: "poster_url", type: "varchar", length: 255, nullable: true })
  posterUrl: string | null;

  @Column({ name: "banner_url", type: "varchar", length: 255, nullable: true })
  bannerUrl: string | null;

  @Column({ name: "trailer_url", type: "varchar", length: 255, nullable: true })
  trailerUrl: string | null;

  /** Calificación promedio del público (0-5). */
  @Column({
    name: "average_rating",
    type: "numeric",
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes: Showtime[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
