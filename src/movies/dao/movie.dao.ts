import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
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
}