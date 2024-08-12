/* eslint-disable */

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MovieService } from './movie.service';
import { AuthGuard } from '@nestjs/passport';
import { GetMoviesDto, MovieDto, RateMovieDto, UpdateMovieDto } from './dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RatingService } from '../rating/rating.service';
import { Movie } from '@prisma/client';

@Controller('movies')
@UseGuards(AuthGuard('jwt'))
@ApiTags('movies')
@ApiBearerAuth()
export class MovieController {
  constructor(private readonly movieService: MovieService,
    private readonly ratingService: RatingService,  // Inject the RatingService
  ) {}


  @Post()
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({ status: 201, description: 'The movie has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed.' })
  create(@Body() createMovieDto: MovieDto) {
    return this.movieService.create(createMovieDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of movies' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or overview' })
  @ApiQuery({ name: 'page', required: true, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: true, description: 'Number of items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by (e.g., releaseDate)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc or desc)' })
  @ApiQuery({ name: 'genre', required: false, description: 'Filter by genre' })
  @ApiResponse({ status: 200, description: 'List of movies' })
  findAll(@Query() query: GetMoviesDto) {
    return this.movieService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a movie by ID' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({ status: 200, description: 'The found movie' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a movie' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a movie' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync movies from external source' })
  @ApiResponse({ status: 200, description: 'Movies have been successfully synced.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error. Failed to sync movies.' })
  syncMovies() {
    return this.movieService.syncMovies();
  }


  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate a movie' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({ status: 200, description: 'Movie rating has been successfully added.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed or invalid movie ID.' })
  async rateMovie(
    @Param('id', ParseIntPipe) movieId: number,
    @Body() rateMovieDto: RateMovieDto,
    @Request() req
  ): Promise<Movie> {
    const userId = req.user.id;    
    return this.ratingService.addRating(userId, { ...rateMovieDto, movieId });
  }
}
