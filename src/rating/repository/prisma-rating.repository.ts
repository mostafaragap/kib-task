/* eslint-disable */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Rating } from '@prisma/client';
import { RateMovieDto } from '../../movie/dto';
import { RatingRepository } from './rating.repository.interface';

@Injectable()
export class PrismaRatingRepository implements RatingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addRating(userId: number, rateMovieDto: RateMovieDto): Promise<Rating> {
    return this.prisma.rating.create({
      data: { userId, ...rateMovieDto },
    });
  }

  async findRatingsByMovieId(movieId: number): Promise<Rating[]> {
    return this.prisma.rating.findMany({ where: { movieId } });
  }
}
