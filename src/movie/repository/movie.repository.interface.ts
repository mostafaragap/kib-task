/* eslint-disable */

import { Movie, Genre } from '@prisma/client';
import { GetMoviesDto, MovieDto } from '../dto';
import { PaginatedMoviesResult } from '../utils/PaginationInterface';

export interface MovieRepository {
  findAll(query: GetMoviesDto): Promise<PaginatedMoviesResult>;
  findOne(id: number): Promise<Movie | null>;
  create(data: MovieDto): Promise<Movie>;
  update(id: number, data: Partial<Movie>): Promise<Movie>;
  remove(id: number): Promise<Movie>;
  findByTmdbId(tmdbId: number): Promise<Movie | null>;
  upsertGenre(data: { where: { name: string }, update: {}, create: { name: string } }): Promise<Genre>;
  upsertMovie(data: { where: { tmdbId: number }, update: any, create: any }): Promise<Movie>;
}
