# Redis Module

A comprehensive Redis integration for NestJS with real-world use cases including caching, rate limiting, and pub/sub.

## Features

- ✅ **Caching** - Cache database queries to reduce load
- ✅ **Rate Limiting** - Prevent API abuse with configurable limits
- ✅ **Pub/Sub** - Real-time notifications across services
- ✅ **Type-safe** - Full TypeScript support

## Configuration

Add these environment variables to your `.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Usage Examples

### 1. Caching (Implemented in DepartmentsService)

```typescript
import { RedisService } from '@modules/redis';

@Injectable()
export class DepartmentsService {
  constructor(private readonly redisService: RedisService) {}

  async findAll(): Promise<Department[]> {
    const cacheKey = 'departments:list';

    // Try cache first
    const cached = await this.redisService.get<Department[]>(cacheKey);
    if (cached) {
      return cached; // Cache HIT
    }

    // Cache MISS - fetch from database
    const departments = await this.repository.findAll();

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, departments, 300);

    return departments;
  }

  // Alternative: Use getOrSet helper
  async findAllWithHelper(): Promise<Department[]> {
    return this.redisService.getOrSet(
      'departments:list',
      () => this.repository.findAll(),
      300, // TTL in seconds
    );
  }
}
```

### 2. Cache Invalidation

```typescript
async create(data: CreateDto): Promise<Department> {
  const created = await this.repository.create(data);

  // Invalidate list cache when data changes
  await this.redisService.delByPattern('departments:list:*');

  return created;
}

async update(id: string, data: UpdateDto): Promise<Department> {
  const updated = await this.repository.update(id, data);

  // Invalidate specific entity and list caches
  await this.redisService.del(`departments:${id}`);
  await this.redisService.delByPattern('departments:list:*');

  return updated;
}
```

### 3. Rate Limiting (Implemented via Guard)

```typescript
import { RateLimitGuard, RateLimit } from '@common/guards/rate-limit.guard';

@Controller('api')
@UseGuards(RateLimitGuard)
export class ApiController {
  
  @Get('data')
  @RateLimit(100, 60) // 100 requests per 60 seconds
  async getData() {
    return { data: 'This endpoint is rate limited' };
  }

  @Post('expensive-operation')
  @RateLimit(5, 60) // Only 5 requests per minute
  async expensiveOperation() {
    return { result: 'Done' };
  }
}
```

Response headers for rate limiting:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Seconds until window resets

### 4. Pub/Sub for Real-time Notifications

```typescript
// Publisher (e.g., in DepartmentsService)
async create(data: CreateDto): Promise<Department> {
  const created = await this.repository.create(data);

  // Publish event
  await this.redisService.publish('department:created', {
    action: 'created',
    data: created,
    timestamp: new Date().toISOString(),
  });

  return created;
}

// Subscriber (e.g., in WebsocketGateway)
@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async onModuleInit() {
    // Subscribe to department events
    await this.redisService.subscribe('department:created', (message) => {
      // Broadcast to all WebSocket clients
      this.websocketGateway.broadcastToAll(message);
    });
  }
}
```

### 5. Session Storage

```typescript
async setUserSession(userId: string, sessionData: any): Promise<void> {
  await this.redisService.set(
    `session:${userId}`,
    sessionData,
    3600, // 1 hour TTL
  );
}

async getUserSession(userId: string): Promise<any> {
  return this.redisService.get(`session:${userId}`);
}

async invalidateSession(userId: string): Promise<void> {
  await this.redisService.del(`session:${userId}`);
}
```

### 6. Hash Operations (User Preferences)

```typescript
async setUserPreference(userId: string, key: string, value: any): Promise<void> {
  await this.redisService.hset(`user:${userId}:prefs`, key, value);
}

async getUserPreference(userId: string, key: string): Promise<any> {
  return this.redisService.hget(`user:${userId}:prefs`, key);
}

async getAllUserPreferences(userId: string): Promise<Record<string, any>> {
  return this.redisService.hgetall(`user:${userId}:prefs`);
}
```

### 7. Simple Queue (Background Jobs)

```typescript
// Add job to queue
async addJob(job: any): Promise<void> {
  await this.redisService.rpush('jobs:email', job);
}

// Process jobs (in a worker)
async processJobs(): Promise<void> {
  while (true) {
    const job = await this.redisService.lpop('jobs:email');
    if (job) {
      await this.sendEmail(job);
    }
    await sleep(1000); // Wait 1 second
  }
}
```

## API Reference

### Basic Operations

| Method | Description |
|--------|-------------|
| `set(key, value, ttl?)` | Set value with optional TTL |
| `get<T>(key)` | Get value by key |
| `del(key)` | Delete a key |
| `delByPattern(pattern)` | Delete keys matching pattern |
| `exists(key)` | Check if key exists |
| `expire(key, ttl)` | Set TTL on existing key |
| `ttl(key)` | Get remaining TTL |

### Caching

| Method | Description |
|--------|-------------|
| `getOrSet<T>(key, callback, ttl)` | Get from cache or execute callback |

### Rate Limiting

| Method | Description |
|--------|-------------|
| `incrementRateLimit(key, window)` | Increment rate limit counter |
| `isRateLimited(id, max, window)` | Check if rate limit exceeded |

### Pub/Sub

| Method | Description |
|--------|-------------|
| `publish(channel, message)` | Publish message to channel |
| `subscribe(channel, callback)` | Subscribe to channel |
| `unsubscribe(channel)` | Unsubscribe from channel |

### Hash Operations

| Method | Description |
|--------|-------------|
| `hset(key, field, value)` | Set hash field |
| `hget(key, field)` | Get hash field |
| `hgetall(key)` | Get all hash fields |
| `hdel(key, field)` | Delete hash field |

### List Operations (Queue)

| Method | Description |
|--------|-------------|
| `rpush(key, value)` | Push to end of list |
| `lpop(key)` | Pop from start of list |
| `llen(key)` | Get list length |

## Testing

Make sure Redis is running:

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally
brew install redis
brew services start redis
```

Test the caching by calling the departments endpoint multiple times:

```bash
# First call - Cache MISS (slower)
curl http://localhost:3001/departments

# Second call - Cache HIT (faster)
curl http://localhost:3001/departments
```

Check the logs - you'll see:
```
[DepartmentsService] Cache MISS: departments:list:all:all
[DepartmentsService] Cache HIT: departments:list:all:all
```

## Best Practices

1. **Use consistent key naming**: `entity:id:field` pattern
2. **Set appropriate TTLs**: Short for frequently changing data
3. **Invalidate on mutations**: Always clear cache when data changes
4. **Use patterns for bulk invalidation**: `delByPattern('departments:*')`
5. **Monitor memory usage**: Set maxmemory policy in Redis config
