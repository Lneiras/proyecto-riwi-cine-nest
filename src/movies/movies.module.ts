import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { MoviesController } from './movies.controller.js';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
