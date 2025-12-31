import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  public username: string;

  @ApiProperty({ example: 'John@123' })
  @IsString()
  @IsNotEmpty()
  public password: string;
}
