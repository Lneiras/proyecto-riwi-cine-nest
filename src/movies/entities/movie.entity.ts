import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('movies')
export class Movie {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 150})
    title: string;
}
