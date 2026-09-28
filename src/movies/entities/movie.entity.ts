import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn
} from "typeorm";
// import { Genre } from "./genre.entity"; 
// import { Status } from "./status.entity";
// import { Showtimes } from "./showtimes.entity";

@Entity('movies')
@Index(['genreId'])
@Index(['statusId'])
@Index(['rating'])
export class Movie {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 150, nullable: false })
    title: string;

    @Column({ type: 'int', nullable: false })
    durationMinutes: number;

    @Column({ type: 'varchar', length: 10, nullable: false })
    rating: string;

    @Column({ type: 'int', nullable: false })
    genreId: number;

    // Relación con Género
    // @ManyToOne(() => Genre, { onDelete: 'RESTRICT' })
    // @JoinColumn({ name: 'genreId' })
    // genre: Genre;

    @Column({ type: 'text', nullable: true })
    synopsis: string | null;

    @Column({ type: 'date', nullable: true })
    releaseDate: Date | string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    posterUrl: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    bannerUrl: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    trailerUrl: string | null;

    @Column({ type: 'int', nullable: false })
    statusId: number;

    // Relación con Estado (ej. Estreno, Cartelera, Archivada)
    // @ManyToOne(() => Status, { onDelete: 'RESTRICT' })
    // @JoinColumn({ name: 'statusId' })
    // status: Status;

    // Relación bidireccional inversa hacia Showtimes
    // Una película tiene muchas funciones (showtimes)
    @OneToMany(() => Showtimes, (showtime) => showtime.movie)
    showtimes: Showtimes[];

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
}


