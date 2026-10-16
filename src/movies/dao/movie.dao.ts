import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, Repository } from "typeorm";
import { CreateMovieDto, UpdateMovieDto } from "../dto/movies.dto.js";
import { Movie } from "../entities/movie.entity.js";
import { Showtime } from "../entities/showtime.entity.js";

@Injectable()
export class MovieDao {
  constructor(
    @InjectRepository(Movie) private readonly repository: Repository<Movie>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateMovieDto): Promise<Movie> {
    const entity = this.repository.create(dto as unknown as Movie);
    return this.repository.save(entity);
  }

  async findAll(): Promise<Movie[]> {
    return this.repository.find({ where: { isActive: true } as any, order: { name: "ASC" } });
  }

  async findOne(id: number): Promise<Movie | null> {
    return this.repository.findOne({ where: { id, isActive: true } as any });
  }

  async findOneByName(name: string): Promise<Movie | null> {
    return this.repository.findOne({ where: { name: ILike(name), isActive: true } as any });
  }

  /**
   * Películas activas que comparten al menos un género con `genres`,
   * mejor calificadas primero (recomendaciones de HU-004).
   */
  async findSimilar(genres: string[], excludeId: number, limit: number): Promise<Movie[]> {
    if (genres.length === 0) return [];
    return this.repository
      .createQueryBuilder("movie")
      .where("movie.isActive = true")
      .andWhere("movie.id != :excludeId", { excludeId })
      .andWhere("movie.genres && :genres", { genres })
      .orderBy("movie.averageRating", "DESC")
      .addOrderBy("movie.id", "ASC")
      .take(limit)
      .getMany();
  }

  async update(id: number, dto: UpdateMovieDto): Promise<Movie | null> {
    await this.repository.update(id, dto as any);
    return this.findOne(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Showtime).update({ movieId: id }, { isActive: false });
      await manager.getRepository(Movie).update(id, { isActive: false });
    });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
