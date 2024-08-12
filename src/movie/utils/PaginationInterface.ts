/* eslint-disable */

import { Movie } from '@prisma/client';

export interface PaginatedMoviesResult {
  data: Movie[];
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}