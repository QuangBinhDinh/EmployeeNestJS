import { HttpStatus } from '@nestjs/common';

type BaseErrorOptions = {
  message: string;
  httpCode?: number;
  stack?: string;
};

export class BaseError extends Error {
  public code: number;

  public constructor({ message, httpCode = 500, stack }: BaseErrorOptions) {
    super(message);

    this.name = new.target.name;
    this.code = httpCode;

    Object.setPrototypeOf(this, new.target.prototype);

    if (stack) {
      this.stack = `${this.name}: ${this.message}\n${stack}`;
    } else {
      Error.captureStackTrace(this, new.target);
    }
  }

  public static fromError(error: unknown, fallbackMessage = 'Unexpected error'): BaseError {
    if (error instanceof BaseError) {
      return error;
    }
    const message = error instanceof Error ? error.message : fallbackMessage;
    const stack = error instanceof Error ? error.stack : undefined;

    return new BaseError({ message, stack });
  }
}

export class NotFoundError extends BaseError {
  public constructor(resource = 'Resource') {
    super({
      message: `${resource} not found`,
      httpCode: HttpStatus.NOT_FOUND,
    });
  }
}

export class ValidationError extends BaseError {
  public constructor(message = 'Validation failed') {
    super({
      message,
      httpCode: HttpStatus.BAD_REQUEST,
    });
  }
}

export class InternalError extends BaseError {
  public constructor(message = 'Internal server error', stack?: string) {
    super({
      message,
      httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
      stack,
    });
  }
}

export class UnauthorizedError extends BaseError {
  public constructor(message = 'Unauthorized') {
    super({
      message,
      httpCode: HttpStatus.UNAUTHORIZED,
    });
  }
}

export class ForbiddenError extends BaseError {
  public constructor(message = 'Forbidden') {
    super({
      message,
      httpCode: HttpStatus.FORBIDDEN,
    });
  }
}

export class ConflictError extends BaseError {
  public constructor(message = 'Conflict') {
    super({
      message,
      httpCode: HttpStatus.CONFLICT,
    });
  }
}

export class BadRequestError extends BaseError {
  public constructor(message = 'Bad request') {
    super({
      message,
      httpCode: HttpStatus.BAD_REQUEST,
    });
  }
}
