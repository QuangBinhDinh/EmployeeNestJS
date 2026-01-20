import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

/**
 * Generic response wrapper for external API calls
 */
export interface ExternalApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: ApiError;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

/**
 * Error structure for failed API calls
 */
export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * Base query parameters for GET requests
 */
export class QueryDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean = false;

  @IsOptional()
  filters?: Record<string, any>;
}
