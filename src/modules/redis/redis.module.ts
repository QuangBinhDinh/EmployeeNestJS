import { Global, Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { RedisPubSubService } from './redis-pubsub.service';

@Global()
@Module({
  providers: [RedisCacheService, RedisPubSubService],
  exports: [RedisCacheService, RedisPubSubService],
})
export class RedisModule {}
