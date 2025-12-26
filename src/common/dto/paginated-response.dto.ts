import { ApiProperty } from '@nestjs/swagger';

export class MetaDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  pageId: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  pageSize: number;

  @ApiProperty({ description: 'Total number of items', example: 25 })
  totalCount: number;

  @ApiProperty({ description: 'Whether there are more pages', example: false })
  hasNext: boolean;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  status: number;

  @ApiProperty({ description: 'Response message', example: '' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ description: 'Pagination metadata', required: false, type: MetaDto })
  meta?: MetaDto;
}
