import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    Index, 
    ManyToOne, 
    JoinColumn } from 'typeorm';
// import { Movie } from './movie.entity';     
// import { Room } from './room.entity';
// import { Format } from './format.entity';
// import { Language } from './language.entity';

@Entity("showtimes")
@Index(['movieId'])
@Index(['roomId'])
@Index(['languageId'])
export class Showtimes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  movieId: number;

//   @ManyToOne(() => Movie, (movie) => movie.showtimes, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'movieId' })
//   movie: Movie;

  @Column({ type: "int", nullable: false })
  roomId: number;

//   @ManyToOne(() => Room, (room) => room.showtimes, { onDelete: 'RESTRICT' })
//   @JoinColumn({ name: 'roomId' })
//   room: Room;

  @Column({ type: "int", nullable: false })
  formatId: number;

//   @ManyToOne(() => Format, { onDelete: 'RESTRICT' }) // Ejemplo sin relación inversa obligatoria
//   @JoinColumn({ name: 'formatId' })
//   format: Format;

  @Column({ type: "int", nullable: false })
  languageId: number;

//   @ManyToOne(() => Language, { onDelete: 'RESTRICT' })
//   @JoinColumn({ name: 'languageId' })
//   language: Language;

  @Column({ type: "timestamptz", nullable: false }) // Corregido: timestamptz
  dateTime: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  basePrice: string;
}
