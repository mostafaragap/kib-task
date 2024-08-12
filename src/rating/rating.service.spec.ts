/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from './rating.service';
import { RatingRepository } from './repository/rating.repository.interface';
import { MovieRepository } from '../movie/repository/movie.repository.interface';
import { RateMovieDto } from '../movie/dto';
import { Movie } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('RatingService', () => {
  let service: RatingService;
  let ratingRepository: RatingRepository;
  let movieRepository: MovieRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: 'RatingRepository',
          useValue: {
            addRating: jest.fn(),
            findRatingsByMovieId: jest.fn(),
          },
        },
        {
          provide: 'MovieRepository',
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    ratingRepository = module.get<RatingRepository>('RatingRepository');
    movieRepository = module.get<MovieRepository>('MovieRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addRating', () => {
    it('should add a rating and update the movie average rating', async () => {
      const userId = 1;
      const movieId = 1;
      const rateMovieDto: RateMovieDto = { movieId, rating: 4.5 };

      // Mock ratings array with the full structure expected by the method
      const mockRatings = [
        { id: 1, movieId: 1, userId: 1, rating: 4 },
        { id: 2, movieId: 1, userId: 2, rating: 5 },
      ];

      const mockUpdatedMovie: Movie = {
        id: movieId,
        tmdbId: 123,
        title: 'Test Movie',
        overview: 'Test Overview',
        releaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        avgRating: 5,
      };

      jest.spyOn(ratingRepository, 'addRating').mockResolvedValue(undefined);
      jest.spyOn(ratingRepository, 'findRatingsByMovieId').mockResolvedValue(mockRatings);
      jest.spyOn(movieRepository, 'update').mockResolvedValue(mockUpdatedMovie);

      const result = await service.addRating(userId, rateMovieDto);

      expect(result).toEqual(mockUpdatedMovie);
      expect(ratingRepository.addRating).toHaveBeenCalledWith(userId, rateMovieDto);
      expect(ratingRepository.findRatingsByMovieId).toHaveBeenCalledWith(movieId);
      expect(movieRepository.update).toHaveBeenCalledWith(movieId, { avgRating: 5 });
    });

    it('should throw an exception if the movie is not found', async () => {
      const userId = 1;
      const movieId = 1;
      const rateMovieDto: RateMovieDto = { movieId, rating: 4.5 };

      jest.spyOn(ratingRepository, 'addRating').mockRejectedValue(new Error('Movie not found'));

      await expect(service.addRating(userId, rateMovieDto)).rejects.toThrow(
        new HttpException('Movie not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
