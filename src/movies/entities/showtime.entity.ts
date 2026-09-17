import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('showtimes')
export class Showtimes{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({name: 'movie', type:'int'})
    movieId:number;
}