import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { GenderEnum } from '../../employees.type';

export class UpdateEmployeeRequest {
  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Birth date in YYYY-MM-DD format',
  })
  public birthDate?: string;

  @IsString()
  @IsOptional()
  @Length(1, 14)
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiPropertyOptional({
    example: 'John',
    description: 'First name (max 14 characters)',
  })
  public firstName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 16)
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name (max 16 characters)',
  })
  public lastName?: string;

  @IsEnum(GenderEnum, { message: 'gender must be M or F' })
  @IsOptional()
  @ApiPropertyOptional({ enum: GenderEnum, example: GenderEnum.MALE })
  public gender?: GenderEnum;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Hire date in YYYY-MM-DD format',
  })
  public hireDate?: string;
}
