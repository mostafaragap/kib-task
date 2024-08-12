/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { MovieRepository } from './repository/movie.repository.interface';
import { CacheService } from '../cache/cache.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { MovieDto, GetMoviesDto } from './dto';
import { Movie } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PaginatedMoviesResult } from './utils/PaginationInterface';

describe('MovieService', () => {
  let service: MovieService;
  let movieRepository: MovieRepository;
  let cacheService: CacheService;
  let tmdbService: TmdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: 'MovieRepository',
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByTmdbId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            upsertGenre: jest.fn(),
            upsertMovie: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
        {
          provide: TmdbService,
          useValue: {
            fetchGenres: jest.fn(),
            fetchMovies: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieRepository = module.get<MovieRepository>('MovieRepository');
    cacheService = module.get<CacheService>(CacheService);
    tmdbService = module.get<TmdbService>(TmdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached data if available', async () => {
      const query: GetMoviesDto = { page: 1, limit: 10 };
      const cachedResult: PaginatedMoviesResult = {
        data: [],
        totalItems: 0,
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedResult);

      const result = await service.findAll(query);

      expect(result).toEqual(cachedResult);
      expect(cacheService.get).toHaveBeenCalledWith(service['generateCacheKey'](query));
      expect(movieRepository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch data from repository if not cached', async () => {
      const query: GetMoviesDto = { page: 1, limit: 10 };
      const paginatedResult: PaginatedMoviesResult = {
        data: [],
        totalItems: 0,
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(movieRepository, 'findAll').mockResolvedValue(paginatedResult);
      jest.spyOn(cacheService, 'set').mockResolvedValue(null);

      const result = await service.findAll(query);

      expect(result).toEqual(paginatedResult);
      expect(movieRepository.findAll).toHaveBeenCalledWith(query);
      expect(cacheService.set).toHaveBeenCalledWith(service['generateCacheKey'](query), paginatedResult, service['cacheTTL']);
    });
  });

  describe('findOne', () => {
    it('should return cached movie if available', async () => {
      const movieId = 1;
      const cachedMovie: Movie = {
        id: 1,
        tmdbId: 1,
        title: 'Test Movie',
        overview: 'Overview',
        releaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        avgRating: 0,
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedMovie);

      const result = await service.findOne(movieId);

      expect(result).toEqual(cachedMovie);
      expect(cacheService.get).toHaveBeenCalledWith(`movie:${movieId}`);
      expect(movieRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw an error if movie is not found', async () => {
      const movieId = 1;

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(movieId)).rejects.toThrow(
        new HttpException('Movie not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should fetch movie from repository if not cached', async () => {
      const movieId = 1;
      const movie: Movie = {
        id: 1,
        tmdbId: 1,
        title: 'Test Movie',
        overview: 'Overview',
        releaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        avgRating: 0,
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);
      jest.spyOn(cacheService, 'set').mockResolvedValue(null);

      const result = await service.findOne(movieId);

      expect(result).toEqual(movie);
      expect(movieRepository.findOne).toHaveBeenCalledWith(movieId);
      expect(cacheService.set).toHaveBeenCalledWith(`movie:${movieId}`, movie, service['cacheTTL']);
    });
  });

  describe('create', () => {
    it('should throw an error if movie with the same TMDB ID already exists', async () => {
      const movieDto: MovieDto = {
        tmdbId: 1,
        title: 'Test Movie',
        overview: 'Overview',
        releaseDate: new Date().toISOString() as unknown as Date,
        genres: [1, 2],
      };

      jest.spyOn(movieRepository, 'findByTmdbId').mockResolvedValue({ id: 1 } as Movie);

      await expect(service.create(movieDto)).rejects.toThrow(
        new HttpException('There is a movie with this Tmb Id', HttpStatus.BAD_REQUEST),
      );
    });

    it('should create a new movie and cache it', async () => {
      const movieDto: MovieDto = {
        tmdbId: 1,
        title: 'Test Movie',
        overview: 'Overview',
        releaseDate: new Date().toISOString() as unknown as Date,
        genres: [1, 2],
      };

      const newMovie: Movie = {
        id: 1,
        tmdbId: 1,
        title: 'Test Movie',
        overview: 'Overview',
        releaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        avgRating: 0,
      };

      jest.spyOn(movieRepository, 'findByTmdbId').mockResolvedValue(null);
      jest.spyOn(movieRepository, 'create').mockResolvedValue(newMovie);
      jest.spyOn(cacheService, 'set').mockResolvedValue(null);
      jest.spyOn(cacheService, 'reset').mockResolvedValue(null);

      const result = await service.create(movieDto);

      expect(result).toEqual(newMovie);
      expect(movieRepository.create).toHaveBeenCalledWith(movieDto);
      expect(cacheService.set).toHaveBeenCalledWith(`movie:${newMovie.id}`, newMovie, service['cacheTTL']);
      expect(cacheService.reset).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update the movie and cache the result', async () => {
      const movieId = 1;
      const updateData = { title: 'Updated Movie' };
      const updatedMovie: Movie = {
        id: 1,
        tmdbId: 1,
        title: 'Updated Movie',
        overview: 'Overview',
        releaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        avgRating: 0,
      };

      jest.spyOn(movieRepository, 'update').mockResolvedValue(updatedMovie);
      jest.spyOn(cacheService, 'set').mockResolvedValue(null);
      jest.spyOn(cacheService, 'reset').mockResolvedValue(null);

      const result = await service.update(movieId, updateData);

      expect(result).toEqual(updatedMovie);
      expect(movieRepository.update).toHaveBeenCalledWith(movieId, updateData);
      expect(cacheService.set).toHaveBeenCalledWith(`movie:${movieId}`, updatedMovie, service['cacheTTL']);
      expect(cacheService.reset).toHaveBeenCalled();
    });

    it('should throw an error if the movie is not found during update', async () => {
      const movieId = 1;
      const updateData = { title: 'Updated Movie' };

      jest.spyOn(movieRepository, 'update').mockRejectedValue(new Error('Movie not found'));

      await expect(service.update(movieId, updateData)).rejects.toThrow(
        new HttpException('Movie not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('remove', () => {
    it('should remove the movie and clear the cache', async () => {
      const movieId = 1;
      const deletedMovie: Movie = {
        id: 1,
        tmdbId: 1,
        title: 'Test Movie',
        overview: 'Overview',
        releaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        avgRating: 0,
      };

      jest.spyOn(movieRepository, 'remove').mockResolvedValue(deletedMovie);
      jest.spyOn(cacheService, 'del').mockResolvedValue(null);
      jest.spyOn(cacheService, 'reset').mockResolvedValue(null);

      const result = await service.remove(movieId);

      expect(result).toEqual(deletedMovie);
      expect(movieRepository.remove).toHaveBeenCalledWith(movieId);
      expect(cacheService.del).toHaveBeenCalledWith(`movie:${movieId}`);
      expect(cacheService.reset).toHaveBeenCalled();
    });

    it('should throw an error if the movie is not found during removal', async () => {
      const movieId = 1;

      jest.spyOn(movieRepository, 'remove').mockRejectedValue(new Error('Movie not found'));

      await expect(service.remove(movieId)).rejects.toThrow(
        new HttpException('Movie not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('syncMovies', () => {
    it('should sync movies and clear the cache', async () => {
      const genres = [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Drama' },
      ];

      const movies = {
        results: [
          {
            id: 100,
            title: 'Test Movie',
            overview: 'Overview',
            release_date: '2024-01-01',
            genre_ids: [1, 2],
          },
        ],
      };

      jest.spyOn(tmdbService, 'fetchGenres').mockResolvedValue(genres);
      jest.spyOn(tmdbService, 'fetchMovies').mockResolvedValue(movies);
      jest.spyOn(movieRepository, 'upsertGenre').mockImplementation(async ({ create }) => ({
        id: genres.find(g => g.name === create.name)?.id || 0,
        ...create,
      }));
      jest.spyOn(movieRepository, 'upsertMovie').mockResolvedValue({} as Movie);
      jest.spyOn(cacheService, 'reset').mockResolvedValue(null);

      await service.syncMovies();

      expect(tmdbService.fetchGenres).toHaveBeenCalledTimes(1);
      expect(tmdbService.fetchMovies).toHaveBeenCalledTimes(1);
      expect(movieRepository.upsertGenre).toHaveBeenCalledTimes(2);
      expect(movieRepository.upsertMovie).toHaveBeenCalledTimes(1);
      expect(cacheService.reset).toHaveBeenCalled();
    });

    it('should throw an error if syncing movies fails', async () => {
      jest.spyOn(tmdbService, 'fetchGenres').mockRejectedValue(new Error('Failed to fetch genres'));

      await expect(service.syncMovies()).rejects.toThrow(
        new HttpException('Erro While Sync Data', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
