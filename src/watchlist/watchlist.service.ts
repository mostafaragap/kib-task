/* eslint-disable */

import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { WatchlistRepository } from './repository/watchlist.repository.interface';
import { PaginatedWatchListResult } from '../movie/utils/PaginatedWatchList';
import { CacheService } from '../cache/cache.service';
import { Watchlist } from '@prisma/client';

@Injectable()
export class WatchlistService {
  constructor(
    @Inject('WatchlistRepository')
    private readonly watchlistRepository: WatchlistRepository,
    private readonly cacheService: CacheService,
  ) {}

  private readonly cacheTTL = 60;

  async addToWatchlist(userId: number, movieId: number): Promise<Watchlist> {
    const existingEntry = await this.watchlistRepository.checkExists(userId, movieId)
    if (existingEntry) {
      throw new HttpException('Movie already exists in your watchlist', HttpStatus.CONFLICT);
    }
    const newEntry = await this.watchlistRepository.addToWatchlist(userId, movieId);
    await this.cacheService.reset();
    return newEntry
  }

  async removeFromWatchlist(userId: number, movieId: number): Promise<void> {
    await this.watchlistRepository.removeFromWatchlist(userId, movieId);
    await this.cacheService.reset();
  }

  async getUserWatchlist(userId: number, page: number, limit: number): Promise<PaginatedWatchListResult> {
    const cacheKey = this.generateCacheKey(userId, page, limit);
    const cachedWatchlist = await this.cacheService.get<PaginatedWatchListResult>(cacheKey);
    if (cachedWatchlist) {
      return cachedWatchlist;
    }

    const result = await this.watchlistRepository.getUserWatchlist(userId, page, +limit);
    await this.cacheService.set(cacheKey, result, this.cacheTTL);

    return result;
  }

  private generateCacheKey(userId: number, page: number, limit: number): string {
    return `watchlist:${userId}:page:${page}:limit:${limit}`;
  }
}
