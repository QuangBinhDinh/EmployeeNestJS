import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateUserRequest {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty({
    example: 'johndoe',
    description: 'Username (3-50 characters, unique)',
  })
  public username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password (minimum 8 characters)',
  })
  public password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address (unique)',
  })
  public email: string;

  @IsString()
  @IsOptional()
  @Length(0, 20)
  @Transform(({ value }: { value: string }) => value?.trim())
  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number (optional, max 20 characters)',
    required: false,
  })
  public phone?: string;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  @Transform(({ value }: { value: string }) => value?.trim())
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name (optional, max 100 characters)',
    required: false,
  })
  public fullName?: string;
}
