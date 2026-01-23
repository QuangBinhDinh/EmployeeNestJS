import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export class GetDeviceDetailLogResponse {
  @ApiProperty({ example: '1', description: 'Detail log ID' })
  public id: number;

  @ApiProperty({ example: 'ACC123456', description: 'Account number' })
  public accountNo: string;

  @ApiProperty({ example: '2024-01-15T11:00:00.000Z', description: 'Action timestamp' })
  public message: string;

  @ApiProperty({ example: '2024-01-15T11:00:00.000Z', description: 'Creation timestamp' })
  public createdAt: string;

  @ApiProperty({ example: '2024-01-20T16:00:00.000Z', description: 'Last update timestamp' })
  public updatedAt: string;
}

export class GetDeviceLogResponse {
  @ApiProperty({ example: '1', description: 'Device log ID' })
  public id: number;

  @ApiProperty({ example: 'd001', description: 'Device ID' })
  public deviceId: string;

  @ApiProperty({ example: 'ACC123456', description: 'Account number' })
  public accountNo: string;

  @ApiProperty({ example: 'iOS', description: 'Device platform' })
  public platform: string;

  @ApiProperty({ example: '14.4', description: 'Operating system version' })
  public osVersion: string;

  @ApiProperty({ example: '1.0.3', description: 'Application version' })
  public appVersion: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Creation timestamp' })
  public createdAt: string;

  @ApiProperty({ example: '2024-01-20T15:45:00.000Z', description: 'Last update timestamp' })
  public updatedAt: string;

  @ApiProperty({
    type: [GetDeviceDetailLogResponse],
    description: 'Associated device detail logs',
  })
  @IsArray()
  @Type(() => GetDeviceDetailLogResponse)
  @ValidateNested({ each: true })
  public logs: GetDeviceDetailLogResponse[];
}
