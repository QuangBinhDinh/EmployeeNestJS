import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { GenderEnum } from '../../employees.type';

export class CreateEmployeeRequest {
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

  @IsEnum(GenderEnum, { message: 'gender must be M or F' })
  @IsNotEmpty()
  @ApiProperty({ enum: GenderEnum, example: GenderEnum.MALE })
  public gender: GenderEnum;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-01-01',
    description: 'Hire date in YYYY-MM-DD format',
  })
  public hireDate: string;
}
