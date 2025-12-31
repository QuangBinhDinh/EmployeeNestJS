import { ApiProperty } from '@nestjs/swagger';

export class GetDepartmentResponse {
  @ApiProperty({ example: 'd001', description: 'Department number' })
  public deptNo: string;

  @ApiProperty({ example: 'Marketing', description: 'Department name' })
  public deptName: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Creation timestamp' })
  public createdAt: string;

  @ApiProperty({ example: '2024-01-20T15:45:00.000Z', description: 'Last update timestamp' })
  public updatedAt: string;
}
