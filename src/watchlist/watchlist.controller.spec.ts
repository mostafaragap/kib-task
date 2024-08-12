/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { AddToWatchList, GetAllWatchList } from './dto';
import { Watchlist } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('WatchlistController', () => {
  let controller: WatchlistController;
  let watchlistService: WatchlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: {
            addToWatchlist: jest.fn(),
            removeFromWatchlist: jest.fn(),
            getUserWatchlist: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WatchlistController>(WatchlistController);
    watchlistService = module.get<WatchlistService>(WatchlistService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addToWatchlist', () => {
    it('should call WatchlistService.addToWatchlist with correct parameters', async () => {
      const movieId = 1;
      const req = { user: { id: 1 } };
      const watchlistItem: Watchlist = {
        id: 1,
        userId: req.user.id,
        movieId,
      };

      jest.spyOn(watchlistService, 'addToWatchlist').mockResolvedValue(watchlistItem);

      const result = await controller.addToWatchlist(movieId, req);

      expect(result).toEqual(watchlistItem);
      expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(req.user.id, movieId);
    });

    it('should throw an error if movie is already in the watchlist', async () => {
      const movieId = 1;
      const req = { user: { id: 1 } };

      jest.spyOn(watchlistService, 'addToWatchlist').mockRejectedValue(
        new HttpException('Movie already exists in your watchlist', HttpStatus.CONFLICT),
      );

      await expect(controller.addToWatchlist(movieId, req)).rejects.toThrow(
        new HttpException('Movie already exists in your watchlist', HttpStatus.CONFLICT),
      );
    });
  });

  describe('removeFromWatchlist', () => {
    it('should call WatchlistService.removeFromWatchlist with correct parameters', async () => {
      const movieId = 1;
      const req = { user: { id: 1 } };

      jest.spyOn(watchlistService, 'removeFromWatchlist').mockResolvedValue(null);

      await controller.removeFromWatchlist(movieId, req);

      expect(watchlistService.removeFromWatchlist).toHaveBeenCalledWith(req.user.id, movieId);
    });
  });

  describe('getUserWatchlist', () => {
    it('should call WatchlistService.getUserWatchlist with correct parameters', async () => {
      const query: GetAllWatchList = { page: 1, limit: 10 };
      const req = { user: { id: 1 } };
      const paginatedResult = {
        data: [],
        totalItems: 0,
        currentPage: query.page,
        itemsPerPage: query.limit,
        totalPages: 1,
      };

      jest.spyOn(watchlistService, 'getUserWatchlist').mockResolvedValue(paginatedResult);

      const result = await controller.getUserWatchlist(req, query);

      expect(result).toEqual(paginatedResult);
      expect(watchlistService.getUserWatchlist).toHaveBeenCalledWith(req.user.id, query.page, query.limit);
    });
  });
});
