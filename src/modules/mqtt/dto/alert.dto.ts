import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export class AlertDto {
  @ApiProperty({ example: 'alert-001', description: 'Unique alert identifier' })
  @IsString()
  @IsNotEmpty()
  alertId: string;

  @ApiProperty({ enum: AlertSeverity, example: AlertSeverity.WARNING })
  @IsEnum(AlertSeverity)
  @IsNotEmpty()
  severity: AlertSeverity;

  @ApiProperty({ example: 'Temperature threshold exceeded', description: 'Alert message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'sensor-001', description: 'Source of the alert' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: 'temperature', description: 'Type of the source' })
  @IsString()
  @IsOptional()
  sourceType?: string;

  @ApiProperty({ example: '2026-01-21T10:30:00Z' })
  @IsOptional()
  timestamp?: string;

  @ApiProperty({ example: { threshold: 30, actual: 35 } })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
