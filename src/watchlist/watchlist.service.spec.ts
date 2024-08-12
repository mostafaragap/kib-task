/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service';
import { WatchlistRepository } from './repository/watchlist.repository.interface';
import { CacheService } from '../cache/cache.service';
import { Watchlist } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PaginatedWatchListResult } from '../movie/utils/PaginatedWatchList';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let watchlistRepository: WatchlistRepository;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: 'WatchlistRepository',
          useValue: {
            checkExists: jest.fn(),
            addToWatchlist: jest.fn(),
            removeFromWatchlist: jest.fn(),
            getUserWatchlist: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
    watchlistRepository = module.get<WatchlistRepository>('WatchlistRepository');
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToWatchlist', () => {
    it('should add a movie to the watchlist', async () => {
      const userId = 1;
      const movieId = 1;
      const watchlistItem: Watchlist = { id: 1, userId, movieId };

      jest.spyOn(watchlistRepository, 'checkExists').mockResolvedValue(null);
      jest.spyOn(watchlistRepository, 'addToWatchlist').mockResolvedValue(watchlistItem);
      jest.spyOn(cacheService, 'reset').mockResolvedValue(null);

      const result = await service.addToWatchlist(userId, movieId);

      expect(result).toEqual(watchlistItem);
      expect(watchlistRepository.checkExists).toHaveBeenCalledWith(userId, movieId);
      expect(watchlistRepository.addToWatchlist).toHaveBeenCalledWith(userId, movieId);
      expect(cacheService.reset).toHaveBeenCalled();
    });

    it('should throw an error if the movie is already in the watchlist', async () => {
      const userId = 1;
      const movieId = 1;

      jest.spyOn(watchlistRepository, 'checkExists').mockResolvedValue({
        id: 1,
        movieId: 1,
        userId: 1,
      });
      await expect(service.addToWatchlist(userId, movieId)).rejects.toThrow(
        new HttpException('Movie already exists in your watchlist', HttpStatus.CONFLICT),
      );
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove a movie from the watchlist', async () => {
      const userId = 1;
      const movieId = 1;

      jest.spyOn(watchlistRepository, 'removeFromWatchlist').mockResolvedValue(null);
      jest.spyOn(cacheService, 'reset').mockResolvedValue(null);

      await service.removeFromWatchlist(userId, movieId);

      expect(watchlistRepository.removeFromWatchlist).toHaveBeenCalledWith(userId, movieId);
      expect(cacheService.reset).toHaveBeenCalled();
    });
  });

  describe('getUserWatchlist', () => {
    it('should return the cached watchlist if available', async () => {
      const userId = 1;
      const page = 1;
      const limit = 10;
      const cachedResult: PaginatedWatchListResult = {
        data: [],
        totalItems: 0,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: 1,
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedResult);

      const result = await service.getUserWatchlist(userId, page, limit);

      expect(result).toEqual(cachedResult);
      expect(cacheService.get).toHaveBeenCalledWith(service['generateCacheKey'](userId, page, limit));
      expect(watchlistRepository.getUserWatchlist).not.toHaveBeenCalled();
    });

    it('should fetch the watchlist from the repository if not cached', async () => {
      const userId = 1;
      const page = 1;
      const limit = 10;
      const paginatedResult: PaginatedWatchListResult = {
        data: [],
        totalItems: 0,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: 1,
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(watchlistRepository, 'getUserWatchlist').mockResolvedValue(paginatedResult);
      jest.spyOn(cacheService, 'set').mockResolvedValue(null);

      const result = await service.getUserWatchlist(userId, page, limit);

      expect(result).toEqual(paginatedResult);
      expect(watchlistRepository.getUserWatchlist).toHaveBeenCalledWith(userId, page, limit);
      expect(cacheService.set).toHaveBeenCalledWith(
        service['generateCacheKey'](userId, page, limit),
        paginatedResult,
        service['cacheTTL'],
      );
    });
  });
});
