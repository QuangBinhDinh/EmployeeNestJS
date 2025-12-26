import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateDepartmentRequest {
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty({
    example: 'd010',
    description: 'Department number (exactly 4 characters)',
  })
  public deptNo: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 40)
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty({
    example: 'Engineering',
    description: 'Department name (max 40 characters)',
  })
  public deptName: string;
}
