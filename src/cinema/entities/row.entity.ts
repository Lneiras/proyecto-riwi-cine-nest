import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { Room } from './room.entity.js';
import { Seat } from './seats.entity.js';

@Entity('rows')
@Unique(['roomId', 'letter'])
export class Row {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 5 })
  letter: string; // Ejemplo: "A", "B", "C"

  @Column({ type: 'boolean', nullable: true, default: false })
  isVip: boolean;

  @Column({ type: 'int', name: 'roomId' })
  roomId: number;

  // MUCHAS filas pertenecen a UNA sala
  @ManyToOne(() => Room, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  // RELACIÓN INVERSA: UNA fila tiene MUCHOS asientos
  @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => Seat, (seat) => seat.row)
  seats: Seat[];
}
