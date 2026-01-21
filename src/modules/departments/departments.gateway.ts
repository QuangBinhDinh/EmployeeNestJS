import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { RedisPubSubService } from '@modules/redis';

@WebSocketGateway({ path: '/departments' })
export class DepartmentsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('DepartmentsGateway');
  private clients: Map<WebSocket, string> = new Map();

  constructor(private readonly redisPubSubService: RedisPubSubService) {}

  async afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized with ws library');

    // Subscribe to Redis events and broadcast to all WebSocket clients
    try {
      await this.subscribeToRedisEvents();
      this.logger.log('Successfully subscribed to all Redis events');
    } catch (error) {
      this.logger.error('Failed to subscribe to Redis events:', error);
    }
  }

  /**
   * Subscribe to Redis pub/sub channels for department events
   */
  private async subscribeToRedisEvents(): Promise<void> {
    // Listen to department:created events
    await this.redisPubSubService.subscribe('department:created', (event) => {
      this.broadcastToAll({
        type: 'department:created',
        ...event,
      });
    });

    // Listen to department:updated events
    await this.redisPubSubService.subscribe('department:updated', (event) => {
      this.broadcastToAll({
        type: 'department:updated',
        ...event,
      });
    });

    // Listen to department:deleted events
    await this.redisPubSubService.subscribe('department:deleted', (event) => {
      this.broadcastToAll({
        type: 'department:deleted',
        ...event,
      });
    });
  }

  handleConnection(client: WebSocket) {
    const clientId = this.generateClientId();
    this.clients.set(client, clientId);
    this.logger.log(`Client connected: ${clientId}`);

    // Send welcome message
    this.sendToClient(client, {
      type: 'connection',
      message: 'Connected to WebSocket server',
      clientId,
    });

    // Listen for messages from this client
    client.on('message', (data: WebSocket.Data) => {
      this.handleMessage(data, client);
    });

    // Handle errors
    client.on('error', (error) => {
      this.logger.error(`WebSocket error for ${clientId}:`, error);
    });
  }

  handleDisconnect(client: WebSocket) {
    const clientId = this.clients.get(client);
    this.logger.log(`Client disconnected: ${clientId}`);
    this.clients.delete(client);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: WebSocket.Data, client: WebSocket): void {
    // need to switch case in here
    const clientId = this.clients.get(client);
    this.logger.log(`Message received from ${clientId}:`, data.toString());

    // Parse message if it's a string
    let message: any;
    const dataStr = data.toString();

    try {
      message = JSON.parse(dataStr);
    } catch {
      message = dataStr;
    }

    // Send response back
    this.sendToClient(client, {
      type: 'message',
      data: `Hello, you sent: ${JSON.stringify(message)}`,
      timestamp: new Date().toISOString(),
      originalMessage: message,
    });
  }

  /**
   * Send message to specific client
   */
  private sendToClient(client: WebSocket, data: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcastToAll(data: any): void {
    let sentCount = 0;
    this.clients.forEach((clientId, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
        sentCount++;
      }
    });
    this.logger.debug(`Broadcasted message to ${sentCount} clients`);
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
