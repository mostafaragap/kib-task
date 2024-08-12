/* eslint-disable */

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RatingRepository } from './repository/rating.repository.interface';
import { MovieRepository } from '../movie/repository/movie.repository.interface';
import { Movie } from '@prisma/client';
import { RateMovieDto } from '../movie/dto';

@Injectable()
export class RatingService {
  constructor(
    @Inject('RatingRepository')
    private readonly ratingRepository: RatingRepository,
    @Inject('MovieRepository')
    private readonly movieRepository: MovieRepository,
  ) {}

  async addRating(userId: number, rateMovieDto: RateMovieDto): Promise<Movie> {
    try {
        
        await this.ratingRepository.addRating(userId, rateMovieDto);
        const ratings = await this.ratingRepository.findRatingsByMovieId(rateMovieDto.movieId);
        const avgRating = Math.round(ratings.reduce((sum, current) => sum + current.rating, 0) / ratings.length) 
        return this.movieRepository.update(rateMovieDto.movieId, { avgRating });
    } catch (error) {
        throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);

    }
  }
}
