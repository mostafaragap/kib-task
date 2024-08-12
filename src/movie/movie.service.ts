/* eslint-disable */

import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { MovieRepository } from './repository/movie.repository.interface';
import { MovieDto, GetMoviesDto } from './dto';
import { Movie } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { PaginatedMoviesResult } from './utils/PaginationInterface';
import { TmdbService } from '../tmdb/tmdb.service';

@Injectable()
export class MovieService {
  constructor(
    @Inject('MovieRepository')
    private readonly movieRepository: MovieRepository,
    private readonly cacheService: CacheService,
    private readonly tmdbService: TmdbService,

  ) {}

  private readonly cacheTTL = 60;

  async findAll(query: GetMoviesDto): Promise<PaginatedMoviesResult> {
    const cacheKey = this.generateCacheKey(query);
    
    const cachedData = await this.cacheService.get<PaginatedMoviesResult>(cacheKey);
    if (cachedData) {        
      return cachedData;
    }

    const result = await this.movieRepository.findAll(query);
    await this.cacheService.set(cacheKey, result, this.cacheTTL);

    return result;
  }

  async findOne(id: number): Promise<Movie> {
    const cacheKey = `movie:${id}`;
    const cachedMovie = await this.cacheService.get<Movie>(cacheKey);
    if (cachedMovie) {
      return cachedMovie;
    }

    const movie = await this.movieRepository.findOne(id);
    if (!movie) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }

    await this.cacheService.set(cacheKey, movie, this.cacheTTL);
    return movie;
  }

  async create(data: MovieDto): Promise<Movie> {
    const checkExists = await this.movieRepository.findByTmdbId(data.tmdbId);
    if (checkExists) {
      throw new HttpException('There is a movie with this Tmb Id', HttpStatus.BAD_REQUEST);
    }

    const newMovie = await this.movieRepository.create(data);
    await this.cacheService.set(`movie:${newMovie.id}`, newMovie, this.cacheTTL);
    await this.cacheService.reset();

    return newMovie;
  }

  async update(id: number, data: Partial<Movie>): Promise<Movie> {
    try {
        
        const updatedMovie = await this.movieRepository.update(id, data);
        await this.cacheService.set(`movie:${id}`, updatedMovie, this.cacheTTL);
        await this.cacheService.reset();
    
        return updatedMovie;
    } catch (error) {
        throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);

    }
  }

  async remove(id: number): Promise<Movie> {
    try {
        const deletedMovie = await this.movieRepository.remove(id);
        await this.cacheService.del(`movie:${id}`);
        await this.cacheService.reset();
    
        return deletedMovie;
      
    } catch (error) {
        throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
}

  async syncMovies(): Promise<void> {
    try {
        
        const genreMap = await this.syncGenres();
        await this.syncMoviesToDatabase(genreMap);
        await this.cacheService.reset(); // Clear the cache after syncing
    } catch (error) {
        throw new HttpException('Erro While Sync Data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async syncGenres(): Promise<Map<number, number>> {
    const tmdbGenres = await this.tmdbService.fetchGenres();

    // Map to store TMDB genre ID to local DB genre ID
    const genreMap = new Map<number, number>();

    for (const tmdbGenre of tmdbGenres) {
      const genre = await this.movieRepository.upsertGenre({
        where: { name: tmdbGenre.name },
        update: {},
        create: {
          name: tmdbGenre.name,
        },
      });
      genreMap.set(tmdbGenre.id, genre.id);
    }

    return genreMap;
  }

  private async syncMoviesToDatabase(genreMap: Map<number, number>): Promise<void> {
    const movies = await this.tmdbService.fetchMovies();

    for (const tmdbMovie of movies.results) {
      const genreIds = tmdbMovie.genre_ids.map(id => genreMap.get(id)).filter(id => id !== undefined);

      await this.movieRepository.upsertMovie({
        where: { tmdbId: tmdbMovie.id },
        update: {
          title: tmdbMovie.title,
          overview: tmdbMovie.overview,
          releaseDate: new Date(tmdbMovie.release_date),
          genres: {
            set: genreIds.map(id => ({ id })),
          },
        },
        create: {
          tmdbId: tmdbMovie.id,
          title: tmdbMovie.title,
          overview: tmdbMovie.overview,
          releaseDate: new Date(tmdbMovie.release_date),
          genres: {
            connect: genreIds.map(id => ({ id })),
          },
        },
      });
    }
  }

  private generateCacheKey(query: GetMoviesDto): string {
    const { search, page, limit, sortBy, sortOrder, genre } = query;
    return `movies:${search ?? ''}:${page}:${limit}:${sortBy}:${sortOrder}:${genre}`;
  }
}
