import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseError } from '@common/exceptions/base.error';

export interface ErrorApiResponse {
  status: number;
  message: string;
  data: null;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    // Handle custom BaseError
    if (exception instanceof BaseError) {
      status = exception.code;
      message = exception.message;

      // Log error with appropriate level
      if (status >= 500) {
        this.logger.error(`[${exception.name}] ${message}`, exception.stack);
      } else {
        this.logger.warn(`[${exception.name}] ${message} - ${request.method} ${request.url}`);
      }
    }
    // Handle unknown errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      // Log unknown errors with full stack trace
      this.logger.error(
        'Unexpected error occurred',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Build error response following ApiResponse format
    const errorResponse: ErrorApiResponse = {
      status,
      message,
      data: null,
    };

    response.status(status).json(errorResponse);
  }
}
