import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RedisService } from '@modules/redis';
import { REDIS_CACHE_TTL_SECONDS } from '@/constants';

// Metadata keys
export const CACHE_KEY = 'cache_response';
export const CACHE_INVALIDATE_KEY = 'cache_invalidate';

export interface CacheResponseOptions {
  /**
   * Cache key prefix (e.g., 'departments')
   * If not provided, uses the controller name
   */
  prefix?: string;

  /**
   * TTL in seconds (default: REDIS_CACHE_TTL_SECONDS)
   */
  ttl?: number;
}

export interface CacheInvalidateOptions {
  /**
   * Cache key prefix to invalidate
   * If not provided, uses the controller name
   */
  prefix?: string;
}

/**
 * @CacheResponse decorator - Cache HTTP responses at controller level
 *
 * Automatically generates cache key: {prefix}:{urlPath}:{queryJSON}:v{version}
 * Uses cache versioning for efficient invalidation
 *
 * @example
 * // Cache key: departments:/departments:{"pageId":"1","pageSize":"10"}:v1
 * @Get()
 * @CacheResponse()
 * findAll(@Query() query: PaginationDto) { ... }
 *
 * @example
 * // Cache key: departments:/departments/123:v1
 * @Get(':id')
 * @CacheResponse({ prefix: 'departments', ttl: 600 })
 * findOne(@Param('id') id: string) { ... }
 */
export const CacheResponse = (options: CacheResponseOptions = {}) =>
  SetMetadata(CACHE_KEY, options);

/**
 * @InvalidateCache decorator - Invalidate cache by incrementing version
 *
 * Deletes all cached keys with old version pattern, then increments version.
 * New requests will use new version keys, keeping cache clean.
 *
 * @example
 * @Post()
 * @InvalidateCache()
 * create(@Body() dto: CreateDto) { ... }
 *
 * @example
 * @Put(':id')
 * @InvalidateCache({ prefix: 'departments' })
 * update(@Param('id') id: string, @Body() dto: UpdateDto) { ... }
 */
export const InvalidateCache = (options: CacheInvalidateOptions = {}) =>
  SetMetadata(CACHE_INVALIDATE_KEY, options);

@Injectable()
export class CacheResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheResponseInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Check for @CacheResponse decorator
    const cacheOptions = this.reflector.get<CacheResponseOptions>(CACHE_KEY, context.getHandler());

    // Check for @InvalidateCache decorator
    const invalidateOptions = this.reflector.get<CacheInvalidateOptions>(
      CACHE_INVALIDATE_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const controllerName = context.getClass().name.toLowerCase().replace('controller', '');

    // Handle cache invalidation (POST, PUT, DELETE operations)
    if (invalidateOptions) {
      const prefix = invalidateOptions.prefix || controllerName;

      return next.handle().pipe(
        tap(async () => {
          try {
            await this.incrementCacheVersion(prefix);
            this.logger.debug(`Cache invalidated for prefix: ${prefix}`);
          } catch (error) {
            this.logger.error(`Failed to invalidate cache: ${error}`);
          }
        }),
      );
    }

    // Handle cache response (GET operations)
    if (cacheOptions) {
      const prefix = cacheOptions.prefix || controllerName;
      const ttl = cacheOptions.ttl ?? REDIS_CACHE_TTL_SECONDS;

      // Get current cache version
      const version = await this.getCacheVersion(prefix);

      // Generate cache key from request details
      const cacheKey = this.generateCacheKey(prefix, version, request);

      // Try to get cached response
      const cached = await this.redisService.get<any>(cacheKey);
      if (cached !== null) {
        this.logger.debug(`Cache HIT: ${cacheKey}`);
        return of(cached);
      }

      this.logger.debug(`Cache MISS: ${cacheKey}`);

      // Execute handler and cache the result
      return next.handle().pipe(
        tap(async (response) => {
          try {
            await this.redisService.set(cacheKey, response, ttl);
          } catch (error) {
            this.logger.error(`Failed to cache response: ${error}`);
          }
        }),
      );
    }

    // No caching decorator, just pass through
    return next.handle();
  }

  /**
   * Generate cache key from request details
   * Format: {prefix}:{urlPath}:{queryJSON}:v{version}
   *
   * - urlPath: path with resolved params (e.g., /departments/123)
   * - queryJSON: JSON stringified query params
   * - version: cache version number for invalidation
   */
  private generateCacheKey(prefix: string, version: number, request: any): string {
    const path = request.route?.path || request.path;

    // Get path params (e.g., { id: '123' })
    const params = request.params || {};

    // Get query params (e.g., { pageId: 1, pageSize: 10 })
    const query = request.query || {};

    // Build path with actual param values
    let resolvedPath = path;
    for (const [key, value] of Object.entries(params)) {
      resolvedPath = resolvedPath.replace(`:${key}`, String(value));
    }

    // JSON stringify query params (sorted for consistency)
    const sortedQuery: Record<string, any> = {};
    Object.keys(query)
      .sort()
      .forEach((key) => {
        sortedQuery[key] = query[key];
      });
    const queryJSON = Object.keys(sortedQuery).length > 0 ? JSON.stringify(sortedQuery) : '';

    // Build cache key: prefix:urlPath:queryJSON:vN
    const keyParts = [prefix, resolvedPath];

    if (queryJSON) {
      keyParts.push(queryJSON);
    }

    keyParts.push(`v${version}`);

    return keyParts.join(':');
  }

  /**
   * Get current cache version for a prefix
   */
  private async getCacheVersion(prefix: string): Promise<number> {
    const versionKey = `${prefix}:__version__`;
    const version = await this.redisService.get<number>(versionKey);
    return version ?? 1;
  }

  /**
   * Increment cache version and delete old version keys
   * 1. Get current version
   * 2. Delete all keys with old version pattern
   * 3. Increment version number
   */
  private async incrementCacheVersion(prefix: string): Promise<number> {
    const versionKey = `${prefix}:__version__`;
    const currentVersion = await this.getCacheVersion(prefix);
    const newVersion = currentVersion + 1;

    // Delete all cached keys with old version
    // Pattern: {prefix}:*:v{oldVersion}
    const oldVersionPattern = `${prefix}:*:v${currentVersion}`;
    await this.redisService.delByPattern(oldVersionPattern);
    this.logger.debug(`Deleted old cache keys: ${oldVersionPattern}`);

    // Store new version (no TTL - version persists forever)
    await this.redisService.set(versionKey, newVersion);

    this.logger.debug(`Cache version incremented: ${prefix} v${currentVersion} -> v${newVersion}`);
    return newVersion;
  }
}
