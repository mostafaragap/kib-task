/* eslint-disable */

import { Controller, Post, Delete, Get, Param, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WatchlistService } from './watchlist.service';
import { AddToWatchList, GetAllWatchList } from './dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('watchlist')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post(':movieId')
  @ApiOperation({ summary: 'Add a movie to the user\'s watchlist' })
  @ApiParam({ name: 'movieId', description: 'The ID of the movie to add to the watchlist' })
  @ApiResponse({ status: 201, description: 'The movie has been added to the watchlist.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed or invalid movie ID.' })
  addToWatchlist(@Param("movieId", ParseIntPipe) movieId: number, @Request() req) {
    const userId = req.user.id;    
    return this.watchlistService.addToWatchlist(userId, movieId);
  }

  @Delete(':movieId')
  @ApiOperation({ summary: 'Remove a movie from the user\'s watchlist' })
  @ApiParam({ name: 'movieId', description: 'The ID of the movie to remove from the watchlist' })
  @ApiResponse({ status: 200, description: 'The movie has been removed from the watchlist.' })
  @ApiResponse({ status: 404, description: 'Movie not found in the watchlist' })
  removeFromWatchlist(@Param('movieId', ParseIntPipe) movieId: number, @Request() req) {
    const userId = req.user.id;    
    return this.watchlistService.removeFromWatchlist(userId, movieId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve the user\'s watchlist' })
  @ApiQuery({ name: 'page', required: true, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: true, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'Paginated list of movies in the watchlist' })
  getUserWatchlist(@Request() req, @Query() query: GetAllWatchList) {
    const userId = req.user.id;    
    return this.watchlistService.getUserWatchlist(userId, query.page, query.limit);
  }
}
