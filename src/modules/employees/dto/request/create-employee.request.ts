import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateEmployeeRequest {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({
    example: 999999,
    description: 'Employee number (unique identifier)',
  })
  public empNo: number;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '1990-01-01',
    description: 'Birth date in YYYY-MM-DD format',
  })
  public birthDate: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 14)
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty({
    example: 'John',
    description: 'First name (max 14 characters)',
  })
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 16)
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty({
    example: 'Doe',
    description: 'Last name (max 16 characters)',
  })
  public lastName: string;

  @IsEnum(['M', 'F'])
  @IsNotEmpty()
  @ApiProperty({
    example: 'M',
    description: 'Gender (M or F)',
    enum: ['M', 'F'],
  })
  public gender: 'M' | 'F';

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-01-01',
    description: 'Hire date in YYYY-MM-DD format',
  })
  public hireDate: string;
}
