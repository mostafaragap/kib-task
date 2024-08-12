/* eslint-disable */

// src/movie/dto/rate-movie.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min, Max, isNotEmpty } from 'class-validator';

export class GetAllWatchList {
    @ApiProperty({
      description: 'Page number for pagination',
      example: 1
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number;
  
    @ApiProperty({
      description: 'Number of items per page (max 24)',
      example: 10
    })
    
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(24)
    limit: number;
  }
