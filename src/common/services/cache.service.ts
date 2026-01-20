import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@modules/redis';

/**
 * Cache key prefixes for different entities
 */
export enum CachePrefix {
  DEPARTMENTS = 'cache:departments',
  EMPLOYEES = 'cache:employees',
  USERS = 'cache:users',
}

/**
 * Default TTL values (in seconds)
 */
export enum CacheTTL {
  SHORT = 60, // 1 minute
  MEDIUM = 300, // 5 minutes
  LONG = 3600, // 1 hour
  DAY = 86400, // 24 hours
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Generate cache key for list queries
   */
  private getListKey(prefix: CachePrefix, page?: number, limit?: number): string {
    if (page !== undefined && limit !== undefined) {
      return `${prefix}:list:page:${page}:limit:${limit}`;
    }
    return `${prefix}:list:all`;
  }

  /**
   * Generate cache key for single entity
   */
  private getEntityKey(prefix: CachePrefix, id: string | number): string {
    return `${prefix}:${id}`;
  }

  // ============================================
  // DEPARTMENTS CACHE
  // ============================================

  async getDepartmentsList(page?: number, limit?: number): Promise<any[] | null> {
    const key = this.getListKey(CachePrefix.DEPARTMENTS, page, limit);
    return this.redisService.get<any[]>(key);
  }

  async setDepartmentsList(
    data: any[],
    page?: number,
    limit?: number,
    ttl: number = CacheTTL.MEDIUM,
  ): Promise<void> {
    const key = this.getListKey(CachePrefix.DEPARTMENTS, page, limit);
    await this.redisService.set(key, data, ttl);
    this.logger.debug(`Cached departments list: ${key}`);
  }

  async getDepartment(id: string): Promise<any | null> {
    const key = this.getEntityKey(CachePrefix.DEPARTMENTS, id);
    return this.redisService.get<any>(key);
  }

  async setDepartment(id: string, data: any, ttl: number = CacheTTL.MEDIUM): Promise<void> {
    const key = this.getEntityKey(CachePrefix.DEPARTMENTS, id);
    await this.redisService.set(key, data, ttl);
    this.logger.debug(`Cached department: ${key}`);
  }

  async invalidateDepartmentCache(): Promise<void> {
    await this.redisService.delByPattern(`${CachePrefix.DEPARTMENTS}:*`);
    this.logger.debug('Invalidated all department cache');
  }

  async invalidateDepartment(id: string): Promise<void> {
    const key = this.getEntityKey(CachePrefix.DEPARTMENTS, id);
    await this.redisService.del(key);
    // Also invalidate list caches since they may contain this department
    await this.redisService.delByPattern(`${CachePrefix.DEPARTMENTS}:list:*`);
    this.logger.debug(`Invalidated department cache: ${id}`);
  }

  // ============================================
  // EMPLOYEES CACHE
  // ============================================

  async getEmployeesList(page?: number, limit?: number): Promise<any[] | null> {
    const key = this.getListKey(CachePrefix.EMPLOYEES, page, limit);
    return this.redisService.get<any[]>(key);
  }

  async setEmployeesList(
    data: any[],
    page?: number,
    limit?: number,
    ttl: number = CacheTTL.SHORT,
  ): Promise<void> {
    const key = this.getListKey(CachePrefix.EMPLOYEES, page, limit);
    await this.redisService.set(key, data, ttl);
    this.logger.debug(`Cached employees list: ${key}`);
  }

  async getEmployee(id: string | number): Promise<any | null> {
    const key = this.getEntityKey(CachePrefix.EMPLOYEES, id);
    return this.redisService.get<any>(key);
  }

  async setEmployee(id: string | number, data: any, ttl: number = CacheTTL.MEDIUM): Promise<void> {
    const key = this.getEntityKey(CachePrefix.EMPLOYEES, id);
    await this.redisService.set(key, data, ttl);
    this.logger.debug(`Cached employee: ${key}`);
  }

  async invalidateEmployeeCache(): Promise<void> {
    await this.redisService.delByPattern(`${CachePrefix.EMPLOYEES}:*`);
    this.logger.debug('Invalidated all employee cache');
  }

  async invalidateEmployee(id: string | number): Promise<void> {
    const key = this.getEntityKey(CachePrefix.EMPLOYEES, id);
    await this.redisService.del(key);
    await this.redisService.delByPattern(`${CachePrefix.EMPLOYEES}:list:*`);
    this.logger.debug(`Invalidated employee cache: ${id}`);
  }

  // ============================================
  // GENERIC CACHE OPERATIONS
  // ============================================

  /**
   * Get or fetch with caching
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM,
  ): Promise<T> {
    return this.redisService.getOrSet<T>(key, fetchFn, ttl);
  }
}
