/* eslint-disable */

// src/movie/dto/rate-movie.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AddToWatchList {
  @ApiProperty({
    description: 'The ID of the movie to add to the watchlist',
    example: 12345
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  movieId: number;
}