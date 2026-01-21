import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export enum DeviceCommandType {
  RESTART = 'restart',
  CALIBRATE = 'calibrate',
  UPDATE_CONFIG = 'update_config',
  SHUTDOWN = 'shutdown',
  START = 'start',
  STOP = 'stop',
}

export class DeviceCommandDto {
  @ApiProperty({ example: 'device-001', description: 'Target device identifier' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ enum: DeviceCommandType, example: DeviceCommandType.RESTART })
  @IsString()
  @IsNotEmpty()
  command: DeviceCommandType;

  @ApiProperty({ example: { interval: 5000 }, description: 'Optional command parameters' })
  @IsObject()
  @IsOptional()
  params?: Record<string, unknown>;

  @ApiProperty({ example: 'admin', description: 'User who issued the command' })
  @IsString()
  @IsOptional()
  issuedBy?: string;
}

export class DeviceStatusDto {
  @ApiProperty({ example: 'device-001' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ example: 'online' })
  @IsString()
  @IsNotEmpty()
  status: 'online' | 'offline' | 'error' | 'maintenance';

  @ApiProperty({ example: 85 })
  @IsOptional()
  batteryLevel?: number;

  @ApiProperty({ example: '1.2.3' })
  @IsOptional()
  firmwareVersion?: string;

  @ApiProperty({ example: '2026-01-21T10:30:00Z' })
  @IsOptional()
  lastSeen?: string;
}
