import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MovieFunction } from "./function.entity.js";

// Clasificación por edades de una película.
// Usamos un enum para que la base de datos solo acepte estos valores.
export enum MovieClassification {
  TODOS = "TODOS",
  MAYORES_7 = "7+",
  MAYORES_12 = "12+",
  MAYORES_15 = "15+",
  MAYORES_18 = "18+",
}

// Tabla "movies": el catálogo de películas.
// Solo tiene los datos que necesita la cartelera (HU-003).

@Entity("movies")
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 200 })
  title: string;

  // Guardamos solo la URL de la imagen, no la imagen en sí.
  @Column({ name: "poster_url", type: "varchar", length: 500 })
  posterUrl: string;

  @Column({ type: "varchar", length: 50 })
  genre: string;

  @Column({ type: "enum", enum: MovieClassification })
  classification: MovieClassification;

  // Duración en minutos (ej. 148).
  @Column({ name: "duration_minutes", type: "int" })
  durationMinutes: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  // Relación inversa: UNA película tiene MUCHAS funciones.
  // No crea columna; sirve para hacer joins desde la película (Task 2).
  @OneToMany(() => MovieFunction, (movieFunction) => movieFunction.movie)
  functions: MovieFunction[];
}
