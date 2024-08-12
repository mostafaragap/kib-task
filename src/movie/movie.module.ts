import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaMovieRepository } from './repository/prisma-movie.repository';
import { CustomCacheModule } from '../cache/cache.module';
import { TmdbService } from '../tmdb/tmdb.service';
import { HttpModule } from '@nestjs/axios';
import { RatingService } from '../rating/rating.service';
import { RatingModule } from '../rating/rating.module';
// import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CustomCacheModule, RatingModule, HttpModule],
  controllers: [MovieController],
  providers: [
    MovieService,
    TmdbService,
    RatingService,
    {
      provide: 'MovieRepository',
      useClass: PrismaMovieRepository,
    },
  ],
})
export class MovieModule {}
