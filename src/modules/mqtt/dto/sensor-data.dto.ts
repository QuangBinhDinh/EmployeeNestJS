import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class SensorDataDto {
  @ApiProperty({ example: 'sensor-001', description: 'Unique sensor identifier' })
  @IsString()
  @IsNotEmpty()
  sensorId: string;

  @ApiProperty({ example: 'temperature', description: 'Type of sensor' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 23.5, description: 'Sensor reading value' })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({ example: '°C', description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 'warehouse-a', description: 'Location of the sensor' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '2026-01-21T10:30:00Z', description: 'Timestamp of the reading' })
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class TemperatureReadingDto extends SensorDataDto {
  @ApiProperty({ example: 'temperature' })
  type: string = 'temperature';

  @ApiProperty({ example: '°C' })
  unit: string = '°C';
}

export class HumidityReadingDto extends SensorDataDto {
  @ApiProperty({ example: 'humidity' })
  type: string = 'humidity';

  @ApiProperty({ example: '%' })
  unit: string = '%';
}

export class PressureReadingDto extends SensorDataDto {
  @ApiProperty({ example: 'pressure' })
  type: string = 'pressure';

  @ApiProperty({ example: 'hPa' })
  unit: string = 'hPa';
}
