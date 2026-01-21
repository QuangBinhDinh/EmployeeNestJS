import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: Redis;

  private getConfig(): RedisOptions {
    return {
      host: process.env.REDIS_CACHE_HOST || process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_CACHE_PORT || process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_CACHE_PASSWORD || process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_CACHE_DB || process.env.REDIS_DB || '0'),
    };
  }

  async onModuleInit() {
    const config = this.getConfig();

    this.client = new Redis(config);

    this.client.on('connect', () => {
      this.logger.log(`Redis Cache connected (${config.host}:${config.port})`);
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Cache error:', err);
    });

    await this.waitForConnection();
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client.status === 'ready') {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Redis Cache connection timeout'));
      }, 5000);

      this.client.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.client.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  async onModuleDestroy() {
    await this.client?.quit();
    this.logger.log('Redis Cache connection closed');
  }

  isReady(): boolean {
    return this.client?.status === 'ready';
  }

  // ============================================
  // BASIC KEY-VALUE OPERATIONS
  // ============================================

  /**
   * Set a value with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  /**
   * Get a value by key
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Delete keys by pattern
   */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set TTL on existing key
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // ============================================
  // CACHING HELPERS
  // ============================================

  /**
   * Get or set cache - fetch from cache or execute callback and cache the result
   */
  async getOrSet<T>(key: string, callback: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache MISS: ${key}`);
    const result = await callback();
    await this.set(key, result, ttlSeconds);
    return result;
  }

  // ============================================
  // RATE LIMITING
  // ============================================

  /**
   * Increment counter for rate limiting
   * Returns the current count and whether it's the first request in the window
   */
  async incrementRateLimit(
    key: string,
    windowSeconds: number,
  ): Promise<{ count: number; isFirst: boolean }> {
    const count = await this.client.incr(key);
    const isFirst = count === 1;

    if (isFirst) {
      await this.client.expire(key, windowSeconds);
    }

    return { count, isFirst };
  }

  /**
   * Check if rate limit exceeded
   */
  async isRateLimited(
    identifier: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<{ limited: boolean; remaining: number; resetIn: number }> {
    const key = `rate_limit:${identifier}`;
    const { count } = await this.incrementRateLimit(key, windowSeconds);
    const remaining = Math.max(0, maxRequests - count);
    const resetIn = await this.ttl(key);

    return {
      limited: count > maxRequests,
      remaining,
      resetIn,
    };
  }

  // ============================================
  // HASH OPERATIONS (useful for storing objects)
  // ============================================

  /**
   * Set hash field
   */
  async hset(key: string, field: string, value: any): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  /**
   * Get hash field
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Get all hash fields
   */
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const data = await this.client.hgetall(key);
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        result[field] = JSON.parse(value) as T;
      } catch {
        result[field] = value as unknown as T;
      }
    }
    return result;
  }

  /**
   * Delete hash field
   */
  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  // ============================================
  // LIST OPERATIONS (useful for queues)
  // ============================================

  /**
   * Push to list (right)
   */
  async rpush(key: string, value: any): Promise<void> {
    await this.client.rpush(key, JSON.stringify(value));
  }

  /**
   * Pop from list (left) - FIFO queue
   */
  async lpop<T>(key: string): Promise<T | null> {
    const value = await this.client.lpop(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Get list length
   */
  async llen(key: string): Promise<number> {
    return await this.client.llen(key);
  }
}
