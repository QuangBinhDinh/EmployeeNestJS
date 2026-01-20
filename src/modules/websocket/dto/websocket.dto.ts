import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO for sending messages
 */
export class MessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

/**
 * DTO for event data
 */
export class EventDto {
  @IsString()
  @IsNotEmpty()
  event: string;

  @IsOptional()
  data?: any;
}

/**
 * Response structure for WebSocket events
 */
export interface WebSocketResponse<T = any> {
  event: string;
  data: T;
  timestamp?: string;
}
