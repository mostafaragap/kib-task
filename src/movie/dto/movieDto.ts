/* eslint-disable */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsDateString,
  MinLength,
  MaxLength,
  IsISO8601,
  Matches,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsOptional,
} from 'class-validator';

export class MovieDto {
  
  @ApiProperty({ description: 'The TMDB ID of the movie', example: 12345 })
  @Type(() => Number)
  @IsInt()
  tmdbId: number;

  @ApiProperty({ description: 'The title of the movie', example: 'Inception' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'The overview of the movie', example: 'A thief who steals corporate secrets...' })
  @IsString()
  @IsNotEmpty()
  overview: string;

  @ApiProperty({ description: 'The release date of the movie', example: '2010-07-16' })
  @IsString()
  @Matches(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    { message: 'Date must be in the format YYYY-MM-DDTHH:mm:ss.SSSZ' },
  )
   releaseDate: Date;

   @ApiProperty({ description: 'array of genre ids', example: [1,2] })
   @IsArray()
   @IsOptional()
   @ArrayNotEmpty()
   @ArrayUnique()
   @IsInt({ each: true })
   genres: number[];
}
