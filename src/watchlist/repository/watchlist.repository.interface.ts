/* eslint-disable */

import { Watchlist } from '@prisma/client';
import { PaginatedWatchListResult } from '../../movie/utils/PaginatedWatchList';

export interface WatchlistRepository {
  addToWatchlist(userId: number, movieId: number): Promise<Watchlist>;
  removeFromWatchlist(userId: number, movieId: number): Promise<void>;
  checkExists(userId: number, movieId: number): Promise<Watchlist>;
  getUserWatchlist(userId: number, page: number, limit: number): Promise<PaginatedWatchListResult>;
}
