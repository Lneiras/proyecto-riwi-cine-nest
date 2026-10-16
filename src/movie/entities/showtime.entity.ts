import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Tabla "showtimes": catálogo de horarios de inicio (ej. 14:30, 17:00, 21:15).
// Un mismo horario se reutiliza en muchas funciones de distintos días.
@Entity("showtimes")
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  // type "time" guarda solo la hora (sin fecha). TypeORM la devuelve
  // como string con formato "HH:MM:SS" (ej. "14:30:00").
  @Column({ name: "start_time", type: "time", unique: true })
  startTime: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;
}
