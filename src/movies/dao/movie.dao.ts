import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult, Not } from "typeorm";
import { Movie } from "../entities/movie.entity.js";

@Injectable()
export class MovieDao{
    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>
    ){}

    async findMovieById(id:number): Promise<Movie | null>{
        return await this.movieRepository.findOne({
            where:{id},
            relations:[genre, status]
        })
    }

    async findSimilar(genreId: number, excludedMovieId: number):Promise<Movie[]>{
        return await this.movieRepository.find({
            where: {
                id: Not(excludedMovieId),
                genreId,
                // statusId: "Cartelera"
            },
            relations: ['genre'],
            take: 5,
        });
    }
}