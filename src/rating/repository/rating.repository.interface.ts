/* eslint-disable */

import { Rating } from '@prisma/client';
import { RateMovieDto } from '../../movie/dto';

export interface RatingRepository {
  addRating(userId: number, rateMovieDto: RateMovieDto): Promise<Rating>;
  findRatingsByMovieId(movieId: number): Promise<Rating[]>;
}
