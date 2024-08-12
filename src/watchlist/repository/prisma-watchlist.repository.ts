/* eslint-disable */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Watchlist } from '@prisma/client';
import { PaginatedWatchListResult } from '../../movie/utils/PaginatedWatchList';
import { WatchlistRepository } from './watchlist.repository.interface';

@Injectable()
export class PrismaWatchlistRepository implements WatchlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addToWatchlist(userId: number, movieId: number): Promise<Watchlist> {
    return this.prisma.watchlist.create({
      data: { userId, movieId },
    });
  }
  async checkExists(userId: number, movieId: number): Promise<Watchlist> {
    return this.prisma.watchlist.findFirst({where : { userId, movieId}});
  }

  async removeFromWatchlist(userId: number, movieId: number): Promise<void> {
    await this.prisma.watchlist.deleteMany({
      where: { userId, movieId },
    });
  }

  async getUserWatchlist(userId: number, page: number, limit: number): Promise<PaginatedWatchListResult> {
    const skip = (page - 1) * limit;
    const watchlist = await this.prisma.watchlist.findMany({
      where: { userId },
      include: { movie: true },
      skip,
      take: limit,
    });

    const totalItems = await this.prisma.watchlist.count({
      where: { userId },
    });

    return {
      data: watchlist,
      totalItems,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
}
