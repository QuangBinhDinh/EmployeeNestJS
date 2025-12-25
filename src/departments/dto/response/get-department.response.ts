import { ApiProperty } from '@nestjs/swagger';

export class GetDepartmentResponse {
  @ApiProperty({ example: 'd001', description: 'Department number' })
  public deptNo: string;

  @ApiProperty({ example: 'Marketing', description: 'Department name' })
  public deptName: string;
}
