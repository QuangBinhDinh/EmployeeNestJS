import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateDepartmentRequest {
  @IsString()
  @IsOptional()
  @Length(1, 40)
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiPropertyOptional({
    example: 'Research & Development',
    description: 'Department name (max 40 characters)',
  })
  public deptName?: string;
}
