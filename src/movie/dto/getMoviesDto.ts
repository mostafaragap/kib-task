/* eslint-disable */
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
const validSortFields = ['title', 'releaseDate', 'tmdbId', 'createdAt', 'updatedAt'];


export class GetMoviesDto {
  @ApiPropertyOptional({ description: 'Search by title or overview' })
  @IsOptional()
  @IsString()
  search?: string;
  
  @ApiProperty({ description: 'Page number for pagination', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  limit: number;

  @ApiPropertyOptional({ description: 'Field to sort by (e.g., releaseDate)', default: 'releaseDate' })
  @IsOptional()
  @IsString()
  @IsIn(validSortFields) // Update valid fields as needed
  sortBy?: string = 'releaseDate';

  @ApiPropertyOptional({ description: 'Sort order (asc or desc)', default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({ description: 'Filter by genre' })
  @IsOptional()
  @IsString()
  genre?: string;
}