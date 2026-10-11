import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Row } from './row.entity.js';

@Entity('seats')
@Unique(['rowId', 'number'])
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  number: number; // Ejemplo: 1, 2, 3...

  @Column({ type: 'boolean', nullable: true, default: false })
  isPreferential: boolean;

  @Column({ type: 'int', name: 'rowId' })
  rowId: number;

  // MUCHOS asientos pertenecen a UNA fila
  @ManyToOne(() => Row, (row) => row.seats, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rowId' })
  row: Row;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
