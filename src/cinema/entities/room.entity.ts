import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Cinemas } from "./cinemas.entity.js";
import { Row } from "./row.entity.js";

export enum typeRoom {
    IMAX = 'IMAX',
    '2d' = '2d',
    '3d' = '3d',
    '4d' = '4d'
}

@Entity('room')
@Unique(['cinemaId', 'number'])
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    number: number;

    @Column({type: 'enum', enum: typeRoom})
    type: typeRoom;

    @ManyToOne(() => Cinemas, (cinema) => cinema.rooms,{
        onDelete: "CASCADE"
    })
    @JoinColumn({name: "cinema_id"})
    cinema: Cinemas

    @Column({ name: "cinema_id"})
    cinemaId: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(()=> Row, (rows) => rows.room)
    rows: Row[];

}
