/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { RatingService } from '../rating/rating.service';
import { MovieDto, GetMoviesDto, RateMovieDto, UpdateMovieDto } from './dto';
import { Movie } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MovieController', () => {
  let controller: MovieController;
  let movieService: MovieService;
  let ratingService: RatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            syncMovies: jest.fn(),
          },
        },
        {
          provide: RatingService,
          useValue: {
            addRating: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    movieService = module.get<MovieService>(MovieService);
    ratingService = module.get<RatingService>(RatingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call MovieService.create with correct parameters', async () => {
      const createMovieDto: MovieDto = {
        tmdbId: 1,
        title: 'Test Movie',
        overview: 'Overview',
        releaseDate: new Date().toISOString() as unknown as Date,
        genres: [1, 2],
      };
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

      jest.spyOn(movieService, 'create').mockResolvedValue(movie);

      const result = await controller.create(createMovieDto);

      expect(result).toEqual(movie);
      expect(movieService.create).toHaveBeenCalledWith(createMovieDto);
    });
  });

  describe('findAll', () => {
    it('should call MovieService.findAll with correct parameters', async () => {
      const query: GetMoviesDto = { page: 1, limit: 10 };
      const paginatedResult = {
        data: [],
        totalItems: 0,
        currentPage: query.page,
        itemsPerPage: query.limit,
        totalPages: 1,
      };

      jest.spyOn(movieService, 'findAll').mockResolvedValue(paginatedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(paginatedResult);
      expect(movieService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should call MovieService.findOne with correct parameters', async () => {
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

      jest.spyOn(movieService, 'findOne').mockResolvedValue(movie);

      const result = await controller.findOne(movieId);

      expect(result).toEqual(movie);
      expect(movieService.findOne).toHaveBeenCalledWith(movieId);
    });

    it('should throw an error if movie is not found', async () => {
      const movieId = 1;

      jest.spyOn(movieService, 'findOne').mockRejectedValue(
        new HttpException('Movie not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.findOne(movieId)).rejects.toThrow(
        new HttpException('Movie not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should call MovieService.update with correct parameters', async () => {
      const movieId = 1;
      const updateMovieDto: UpdateMovieDto = { title: 'Updated Movie' };
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

      jest.spyOn(movieService, 'update').mockResolvedValue(updatedMovie);

      const result = await controller.update(movieId, updateMovieDto);

      expect(result).toEqual(updatedMovie);
      expect(movieService.update).toHaveBeenCalledWith(movieId, updateMovieDto);
    });
  });

  describe('remove', () => {
    it('should call MovieService.remove with correct parameters', async () => {
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

      jest.spyOn(movieService, 'remove').mockResolvedValue(deletedMovie);

      const result = await controller.remove(movieId);

      expect(result).toEqual(deletedMovie);
      expect(movieService.remove).toHaveBeenCalledWith(movieId);
    });
  });

  describe('syncMovies', () => {
    it('should call MovieService.syncMovies', async () => {
      jest.spyOn(movieService, 'syncMovies').mockResolvedValue(undefined);

      const result = await controller.syncMovies();

      expect(result).toBeUndefined();
      expect(movieService.syncMovies).toHaveBeenCalled();
    });
  });

  describe('rateMovie', () => {
    it('should call RatingService.addRating with correct parameters', async () => {
      const movieId = 1;
      const rateMovieDto: RateMovieDto = { rating: 5, movieId };
      const req = { user: { id: 1 } };
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

      jest.spyOn(ratingService, 'addRating').mockResolvedValue(movie);

      const result = await controller.rateMovie(movieId, rateMovieDto, req);

      expect(result).toEqual(movie);
      expect(ratingService.addRating).toHaveBeenCalledWith(req.user.id, { ...rateMovieDto, movieId });
    });
  });
});
