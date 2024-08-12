import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { PrismaRatingRepository } from './repository/prisma-rating.repository';
import { PrismaMovieRepository } from '../movie/repository/prisma-movie.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    RatingService,
    {
      provide: 'RatingRepository',
      useClass: PrismaRatingRepository,
    },
    {
      provide: 'MovieRepository',
      useClass: PrismaMovieRepository,
    },
  ],
  exports: [RatingService, 'RatingRepository'],
})
export class RatingModule {}
