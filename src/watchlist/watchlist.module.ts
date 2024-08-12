import { Module } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { PrismaWatchlistRepository } from './repository/prisma-watchlist.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomCacheModule } from '../cache/cache.module';
import { MovieModule } from '../movie/movie.module';
// import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CustomCacheModule, MovieModule],
  providers: [
    WatchlistService,
    {
      provide: 'WatchlistRepository',
      useClass: PrismaWatchlistRepository,
    },
  ],
  controllers: [WatchlistController],
})
export class WatchlistModule {}
