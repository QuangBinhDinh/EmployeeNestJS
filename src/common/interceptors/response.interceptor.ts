import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  meta?: {
    pageId: number;
    pageSize: number;
    totalCount: number;
    hasNext: boolean;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(
    @Inject(PaginationMetadata) private readonly paginationMetadata: PaginationMetadata,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        const status = response.statusCode;

        // Check if this is a GET request with pagination params
        const isGetRequest = request.method === 'GET';
        const pageId = request.query.pageId ? parseInt(request.query.pageId as string) : null;
        const pageSize = request.query.pageSize ? parseInt(request.query.pageSize as string) : null;

        const shouldPaginate = isGetRequest && pageId !== null && pageSize !== null;

        // Handle paginated response using metadata
        if (shouldPaginate && this.paginationMetadata.hasMetadata()) {
          const totalCount = this.paginationMetadata.getTotalCount()!;
          const hasNext = pageId * pageSize < totalCount;

          return {
            status,
            message: '',
            data: data as T,
            meta: {
              pageId,
              pageSize,
              totalCount,
              hasNext,
            },
          };
        }

        // Handle non-paginated response
        return {
          status,
          message: '',
          data: data as T,
        };
      }),
    );
  }
}
