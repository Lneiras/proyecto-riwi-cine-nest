import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, MoreThanOrEqual, Repository, UpdateResult } from "typeorm";
import { Showtimes } from "../entities/showtime.entity.js";



@Injectable()
export class ShowtimeDao{
    constructor(
        @InjectRepository(Showtimes)
        private readonly showtimeRepository: Repository<Showtimes[]>
    ){}

    async findFutureShowtimesByMovieId(movieId:number, cityId:number):Promise<Showtimes[]>{
        return this.showtimeRepository.find({
            where: {
                movieId,
                dateTime: MoreThanOrEqual(new Date()),
                room: {
                    cinema: {
                        cityId,
                    },
                },
            },
            relations: [
                'format',
                'language',
                'room',
                'room.cinema',
            ],
            order: {
                dateTime: 'ASC'
            }
        })
    }
}
