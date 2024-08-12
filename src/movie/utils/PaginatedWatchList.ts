/* eslint-disable */

import { Watchlist } from '@prisma/client';

export interface PaginatedWatchListResult {
  data: Watchlist[];
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}