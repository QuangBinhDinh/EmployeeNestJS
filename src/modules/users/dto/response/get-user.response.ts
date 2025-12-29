import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponse {
  @ApiProperty({ example: 1, description: 'User ID' })
  public id: number;

  @ApiProperty({ example: 'johndoe', description: 'Username' })
  public username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  public email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  public phone?: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name', required: false })
  public fullName?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Creation timestamp' })
  public createdAt: string;

  @ApiProperty({ example: '2024-01-20T15:45:00.000Z', description: 'Last update timestamp' })
  public updatedAt: string;
}
