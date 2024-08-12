/* eslint-disable */

import { Prisma } from '@prisma/client';
import { GetMoviesDto } from '../dto';

export function buildMovieQuery(query: GetMoviesDto): { where: Prisma.MovieWhereInput, orderBy: Prisma.MovieOrderByWithRelationInput } {
  const { search, sortBy, sortOrder, genre } = query;


  const where: Prisma.MovieWhereInput = {
    AND: [
      search ? {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { overview: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      } : {},
      genre ? {
        genres: {
          some: {
            name: {
              equals: genre,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      } : {},
    ],
  };

  const orderBy: Prisma.MovieOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };
  
  return { where, orderBy };
}
