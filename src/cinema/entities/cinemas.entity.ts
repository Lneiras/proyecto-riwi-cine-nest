import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { City } from "../../location/entities/city.entity.js";
import { Room } from "./room.entity.js";

// room-type.enum.ts



@Entity('cinemas')
export class Cinemas {

    @PrimaryGeneratedColumn()
    id: Number;

    @Column({ type: "varchar", length: 100, unique: true})
    name: string;

    @ManyToOne(() => City, (city) => city.cinemas, { 
    nullable: false,       // Obligatorio: Todo cine debe estar en una ciudad
    onDelete: 'RESTRICT'   // No permite borrar una ciudad si tiene cines registrados
    })
    @JoinColumn({ name: 'cityId' }) // Forza a que la columna en la BD se llame 'cityId'
    city: City; //esto no se va a ver en la base de datos

    @Column({type: 'int', name: 'cityId'})
    cityId: Number;

    @Column({ type: 'varchar', length: 255})
    address: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    //RELATIONS:
    @OneToMany(()=> Room, (room) => room.cinema)
    rooms: Room[]
}
