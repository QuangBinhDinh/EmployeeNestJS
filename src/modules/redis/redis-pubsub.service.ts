import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisPubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPubSubService.name);
  private subscriber: Redis;
  private publisher: Redis;

  private getConfig(): RedisOptions {
    return {
      host: process.env.REDIS_PUBSUB_HOST || process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PUBSUB_PORT || process.env.REDIS_PORT || '6380'),
      password: process.env.REDIS_PUBSUB_PASSWORD || process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_PUBSUB_DB || process.env.REDIS_DB || '0'),
    };
  }

  async onModuleInit() {
    const config = this.getConfig();

    // Need separate connections for subscriber and publisher
    // Subscriber connection is blocked waiting for messages
    this.subscriber = new Redis(config);
    this.publisher = new Redis(config);

    this.subscriber.on('connect', () => {
      this.logger.log(`Redis PubSub Subscriber connected (${config.host}:${config.port})`);
    });

    this.subscriber.on('error', (err) => {
      this.logger.error('Redis PubSub Subscriber error:', err);
    });

    this.publisher.on('connect', () => {
      this.logger.log(`Redis PubSub Publisher connected (${config.host}:${config.port})`);
    });

    this.publisher.on('error', (err) => {
      this.logger.error('Redis PubSub Publisher error:', err);
    });

    await Promise.all([
      this.waitForConnection(this.subscriber, 'subscriber'),
      this.waitForConnection(this.publisher, 'publisher'),
    ]);
  }

  private async waitForConnection(redis: Redis, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (redis.status === 'ready') {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Redis PubSub ${name} connection timeout`));
      }, 5000);

      redis.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      redis.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  async onModuleDestroy() {
    await this.subscriber?.quit();
    await this.publisher?.quit();
    this.logger.log('Redis PubSub connections closed');
  }

  isReady(): boolean {
    return this.subscriber?.status === 'ready' && this.publisher?.status === 'ready';
  }

  /**
   * Wait until Redis PubSub is ready
   */
  async waitUntilReady(timeoutMs: number = 10000): Promise<void> {
    const startTime = Date.now();
    while (!this.isReady()) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Redis PubSub initialization timeout');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // ============================================
  // PUB/SUB OPERATIONS
  // ============================================

  /**
   * Publish a message to a channel
   */
  async publish(channel: string, message: any): Promise<void> {
    const serialized = JSON.stringify(message);
    await this.publisher.publish(channel, serialized);
    this.logger.debug(`Published to ${channel}:`, message);
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.waitUntilReady();

    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(msg);
          callback(parsed);
        } catch {
          callback(msg);
        }
      }
    });
    this.logger.log(`Subscribed to channel: ${channel}`);
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
    this.logger.log(`Unsubscribed from channel: ${channel}`);
  }
}
