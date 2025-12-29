import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class UpdateUserRequest {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  @Transform(({ value }: { value: string }) => value?.trim())
  @ApiProperty({
    example: 'johndoe_updated',
    description: 'Username (3-50 characters, unique)',
    required: false,
  })
  public username?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'Password (minimum 8 characters)',
    required: false,
  })
  public password?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({
    example: 'john.updated@example.com',
    description: 'Email address (unique)',
    required: false,
  })
  public email?: string;

  @IsString()
  @IsOptional()
  @Length(0, 20)
  @Transform(({ value }: { value: string }) => value?.trim())
  @ApiProperty({
    example: '+9876543210',
    description: 'Phone number (optional, max 20 characters)',
    required: false,
  })
  public phone?: string;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  @Transform(({ value }: { value: string }) => value?.trim())
  @ApiProperty({
    example: 'John Doe Updated',
    description: 'Full name (optional, max 100 characters)',
    required: false,
  })
  public fullName?: string;
}
