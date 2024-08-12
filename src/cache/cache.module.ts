/* eslint-disable */

import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore as any,
      host: process.env.REDIS_HOST || 'redis', // Use the Docker service name 'redis'
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      ttl: 60,  // Time to live in seconds
      max: 100, // Maximum number of items in caches
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CustomCacheModule {}
