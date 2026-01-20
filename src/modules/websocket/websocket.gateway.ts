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

@WebSocketGateway({ path: '/ws' })
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebsocketGateway');
  private clients: Map<WebSocket, string> = new Map();

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized with ws library');
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
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
