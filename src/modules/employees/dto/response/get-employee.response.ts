import { ApiProperty } from '@nestjs/swagger';

export class GetEmployeeResponse {
  @ApiProperty({ example: 10001, description: 'Employee number' })
  public empNo: number;

  @ApiProperty({ example: '1953-09-02', description: 'Birth date' })
  public birthDate: string;

  @ApiProperty({ example: 'Georgi', description: 'First name' })
  public firstName: string;

  @ApiProperty({ example: 'Facello', description: 'Last name' })
  public lastName: string;

  @ApiProperty({ example: 'M', description: 'Gender', enum: ['M', 'F'] })
  public gender: string;

  @ApiProperty({ example: '1986-06-26', description: 'Hire date' })
  public hireDate: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Creation timestamp' })
  public createdAt: string;

  @ApiProperty({ example: '2024-01-20T15:45:00.000Z', description: 'Last update timestamp' })
  public updatedAt: string;
}
