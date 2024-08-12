/* eslint-disable */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Genre, Movie } from '@prisma/client';
import { MovieRepository } from './movie.repository.interface';
import { buildMovieQuery } from '../utils/movieHelper';
import { GetMoviesDto, MovieDto } from '../dto';
import { PaginatedMoviesResult } from '../utils/PaginationInterface';

@Injectable()
export class PrismaMovieRepository implements MovieRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetMoviesDto): Promise<PaginatedMoviesResult> {
    const { page = 1, limit = 10 } = query;
    const { where, orderBy } = buildMovieQuery(query);
    const movies = await this.prisma.movie.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: +limit,
      include: {
        genres: true,
      },
    });

    const totalItems = await this.prisma.movie.count({ where });

    return {
      data: movies,
      totalItems,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findOne(id: number): Promise<Movie | null> {
    return this.prisma.movie.findUnique({
      where: { id },
      include: {
        genres: true,
      },
    });
  }

  async create(data: MovieDto): Promise<Movie> {
    const { genres, ...movieData } = data;
    return this.prisma.movie.create({
      data: {
        ...movieData,
        genres: {
          connect: genres.map((id) => ({ id })),
        },
      },
    });
  }

  async update(id: number, data: Partial<Movie>): Promise<Movie> {
    return this.prisma.movie.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Movie> {
    return this.prisma.movie.delete({ where: { id } });
  }

  async findByTmdbId(tmdbId: number): Promise<Movie | null> {
    return this.prisma.movie.findFirst({ where: { tmdbId } });
  }
  async upsertGenre(data: { where: { name: string }, update: {}, create: { name: string } }): Promise<Genre> {
    return this.prisma.genre.upsert({
      where: data.where,
      update: data.update,
      create: data.create,
    });
  }

  async upsertMovie(data: { where: { tmdbId: number }, update: any, create: any }): Promise<Movie> {
    return this.prisma.movie.upsert({
      where: data.where,
      update: data.update,
      create: data.create,
    });
  }
}
