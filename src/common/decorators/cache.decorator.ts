import { Logger } from '@nestjs/common';
import { RedisCacheService } from '@modules/redis';
import { REDIS_CACHE_TTL_SECONDS } from '@/constants';

export interface CacheOptions {
  /**
   * Cache key prefix (e.g., 'departments', 'users')
   * If not provided, uses the class name (e.g., DepartmentsService -> 'departments')
   */
  prefix?: string;

  /**
   * TTL in seconds (default: uses REDIS_CACHE_TTL_SECONDS from constants)
   */
  ttl?: number;

  /**
   * Custom key generator function
   * Receives the method arguments and should return a unique key suffix
   */
  keyGenerator?: (...args: any[]) => string;
}

export interface CacheInvalidateOptions {
  /**
   * Cache key prefix to invalidate
   * If not provided, uses the class name (e.g., DepartmentsService -> 'departments')
   */
  prefix?: string;
}

/**
 * @Cacheable decorator - Automatically cache method results
 *
 * Requirements: The service class MUST have `redisCacheService` property injected
 *
 * @example
 * // Basic usage - caches with auto-generated key
 * @Cacheable()
 * async findOne(id: string): Promise<User> { ... }
 *
 * @example
 * // With custom prefix and TTL
 * @Cacheable({ prefix: 'users', ttl: 600 })
 * async findAll(): Promise<User[]> { ... }
 *
 * @example
 * // With custom key generator
 * @Cacheable({
 *   prefix: 'users',
 *   keyGenerator: (pageId, pageSize) => `list:${pageId}:${pageSize}`
 * })
 * async findAll(pageId?: number, pageSize?: number): Promise<User[]> { ... }
 */
export function Cacheable(options: CacheOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const methodName = String(propertyKey);
    const logger = new Logger(`Cacheable:${target.constructor.name}`);

    descriptor.value = async function (...args: any[]) {
      // Get RedisCacheService from the class instance (must be injected as 'redisCacheService')
      const redisCacheService: RedisCacheService = (this as any).redisCacheService;

      if (!redisCacheService) {
        logger.warn(`RedisCacheService not found, executing without cache: ${methodName}`);
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      const prefix = options.prefix || target.constructor.name.toLowerCase().replace('service', '');
      const ttl = options.ttl ?? REDIS_CACHE_TTL_SECONDS;

      let keySuffix: string;
      if (options.keyGenerator) {
        keySuffix = options.keyGenerator(...args);
      } else {
        // Auto-generate key from method name and stringified arguments
        const argsKey = args.length > 0 ? `:${args.map((a) => a ?? 'null').join(':')}` : '';
        keySuffix = `${methodName}${argsKey}`;
      }

      const cacheKey = `${prefix}:${keySuffix}`;

      // Use getOrSet pattern from RedisCacheService
      return redisCacheService.getOrSet(cacheKey, () => originalMethod.apply(this, args), ttl);
    };

    return descriptor;
  };
}

/**
 * @CacheInvalidate decorator - Automatically invalidate cache after method execution
 *
 * Invalidates ALL keys with the service prefix (e.g., 'departments:*')
 * This is the safest approach for mutations to avoid cache inconsistency.
 *
 * Requirements: The service class MUST have `redisCacheService` property injected
 *
 * @example
 * // Default: Invalidate all keys with auto-detected prefix
 * @CacheInvalidate()
 * async create(data: CreateDto): Promise<User> { ... }
 *
 * @example
 * // With custom prefix
 * @CacheInvalidate({ prefix: 'users' })
 * async create(data: CreateDto): Promise<User> { ... }
 */
export function CacheInvalidate(options: CacheInvalidateOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const methodName = String(propertyKey);
    const logger = new Logger(`CacheInvalidate:${target.constructor.name}`);

    descriptor.value = async function (...args: any[]) {
      // Execute original method first
      const result = await originalMethod.apply(this, args);

      // Get RedisCacheService from the class instance
      const redisCacheService: RedisCacheService = (this as any).redisCacheService;

      if (!redisCacheService) {
        logger.warn(`RedisCacheService not found, skipping cache invalidation: ${methodName}`);
        return result;
      }

      const prefix = options.prefix || target.constructor.name.toLowerCase().replace('service', '');

      try {
        // Invalidate all keys with the prefix
        await redisCacheService.delByPattern(`${prefix}:*`);
        logger.debug(`Invalidated all cache keys: ${prefix}:*`);
      } catch (error) {
        logger.error(`Failed to invalidate cache: ${error}`);
        // Don't throw - cache invalidation failure shouldn't break the operation
      }

      return result;
    };

    return descriptor;
  };
}
