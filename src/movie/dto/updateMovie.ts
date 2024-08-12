/* eslint-disable */

import { PartialType } from '@nestjs/mapped-types';
import { MovieDto } from './movieDto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateMovieDto extends PartialType(MovieDto) {
  @ApiPropertyOptional({
    description: 'The TMDB ID of the movie (optional)',
  })
  @Type(() => Number)

  tmdbId?: number;

  @ApiPropertyOptional({
    description: 'The title of the movie (optional)',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'The overview of the movie (optional)',
  })
  overview?: string;

  @ApiPropertyOptional({
    description: 'The release date of the movie (optional)',
  })
  releaseDate?: Date;
}
