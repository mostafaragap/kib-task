/* eslint-disable */

// src/tmdb/tmdb.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY');
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  async fetchMovies(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/movie/popular`, {
          params: {
            api_key: this.apiKey,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to fetch movies from TMDB', HttpStatus.BAD_REQUEST);
    }
  }

  async fetchGenres(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/genre/movie/list`, {
        params: {
          api_key: this.apiKey,
        },
      }),
    );

    return response.data.genres;
  }
}
