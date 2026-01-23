import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateDeviceLogRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'd010',
    description: 'Device ID (exactly 4 characters)',
  })
  public deviceId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'd010',
    description: 'Device ID (exactly 4 characters)',
  })
  public accountNo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'iOS',
    description: 'Device ID (exactly 4 characters)',
  })
  public platform: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'd010',
    description: 'Device ID (exactly 4 characters)',
  })
  public osVersion: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'd010',
    description: 'Device ID (exactly 4 characters)',
  })
  public appVersion: string;

  @IsArray()
  @Type(() => String)
  @ApiProperty({
    type: [String],
    description: 'Associated device detail logs',
    isArray: true,
  })
  public logs: string[];
}
