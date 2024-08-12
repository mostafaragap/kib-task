/* eslint-disable */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MovieModule } from './movie/movie.module';
// import { MovienpmController } from './i/movienpm/movienpm.controller';
import { RatingModule } from './rating/rating.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CustomCacheModule } from './cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache/cache.service';

@Module({
  imports: [
    CacheModule.register(),
    CustomCacheModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule, PrismaModule, MovieModule, RatingModule, WatchlistModule],
  controllers: [AppController],
  providers: [AppService, CacheService],
  exports : [CacheService]
})
export class AppModule {}
