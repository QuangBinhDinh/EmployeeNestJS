import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '@modules/redis';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  maxRequests: number;
  windowSeconds: number;
}

/**
 * Decorator to set rate limit on a controller or route
 * Can be used at both class level and method level
 * Method level takes precedence over class level
 *
 * @param maxRequests Maximum requests allowed in the window (default: 100)
 * @param windowSeconds Time window in seconds (default: 60)
 */
export const RateLimit = (maxRequests = 100, windowSeconds = 60) => {
  return SetMetadata(RATE_LIMIT_KEY, { maxRequests, windowSeconds });
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check method-level first, then fall back to class-level
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no rate limit decorator, allow the request
    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Use IP address or user ID as identifier
    const identifier =
      request.user?.id || request.ip || request.headers['x-forwarded-for'] || 'anonymous';

    const routeKey = `${request.method}:${request.route.path}`;
    const key = `${routeKey}:${identifier}`;

    const { limited, remaining, resetIn } = await this.redisService.isRateLimited(
      key,
      options.maxRequests,
      options.windowSeconds,
    );

    // Set rate limit headers
    request.res.setHeader('X-RateLimit-Limit', options.maxRequests);
    request.res.setHeader('X-RateLimit-Remaining', remaining);
    request.res.setHeader('X-RateLimit-Reset', resetIn);

    if (limited) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
