import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { GenderEnum } from '@modules/employees/employees.type';

export class FindByGenderQueryDto {
  @IsEnum(GenderEnum, { message: 'gender must be M or F' })
  @ApiProperty({ enum: GenderEnum, example: GenderEnum.MALE })
  public gender: GenderEnum;
}
