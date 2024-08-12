/* eslint-disable */

// src/movie/dto/rate-movie.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min, Max } from 'class-validator';

export class RateMovieDto {
  @ApiProperty({ description: 'The ID of the movie to rate', example: 1 })
  @Type(() => Number)
  @IsInt()
  movieId: number;

  @ApiProperty({ description: 'The rating for the movie (between 0.5 and 5.0)', example: 4.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(5.0)
  rating: number;
}
