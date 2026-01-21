import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MQTT_CLIENT } from './mqtt.config';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

/**
 * MqttPublisherService
 *
 * Service for publishing messages to MQTT topics.
 * Handles connection management and provides a simple API for publishing.
 */
@Injectable()
export class MqttPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttPublisherService.name);
  private isConnected = false;

  constructor(
    @Inject(MQTT_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      this.logger.error('Failed to connect to MQTT broker on init', error);
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect to the MQTT broker
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      this.logger.log('Successfully connected to MQTT broker');
    } catch (error) {
      this.isConnected = false;
      this.logger.error('MQTT connection failed', error);
      throw error;
    }
  }

  /**
   * Disconnect from the MQTT broker
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      this.isConnected = false;
      this.logger.log('Disconnected from MQTT broker');
    } catch (error) {
      this.logger.error('Error disconnecting from MQTT broker', error);
    }
  }

  /**
   * Publish a message to a specific topic
   *
   * @param topic - The MQTT topic to publish to
   * @param payload - The message payload (will be JSON stringified)
   * @returns Promise that resolves when message is sent
   */
  async publish<T = unknown>(topic: string, payload: T): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('MQTT client not connected, attempting to reconnect...');
      await this.connect();
    }

    try {
      // Use emit for fire-and-forget pattern (typical for MQTT)
      this.client.emit(topic, payload);
      this.logger.debug(`Published to ${topic}: ${JSON.stringify(payload)}`);
    } catch (error) {
      this.logger.error(`Failed to publish to ${topic}`, error);
      throw error;
    }
  }

  /**
   * Send a message and wait for a response (request-response pattern)
   *
   * @param topic - The MQTT topic to send to
   * @param payload - The message payload
   * @param timeoutMs - Timeout in milliseconds (default: 5000)
   * @returns Promise with the response
   */
  async send<TRequest = unknown, TResponse = unknown>(
    topic: string,
    payload: TRequest,
    timeoutMs: number = 5000,
  ): Promise<TResponse | null> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await firstValueFrom(
        this.client.send<TResponse, TRequest>(topic, payload).pipe(
          timeout(timeoutMs),
          catchError((error) => {
            this.logger.error(`Request to ${topic} timed out or failed`, error);
            return of(null);
          }),
        ),
      );
      return response;
    } catch (error) {
      this.logger.error(`Failed to send to ${topic}`, error);
      throw error;
    }
  }

  /**
   * Check if the client is currently connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
