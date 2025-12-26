import { InternalError } from './base.error';
import { NotFoundError } from './base.error';
import { ValidationError } from './base.error';
import { UnauthorizedError } from './base.error';
import { ForbiddenError } from './base.error';
import { ConflictError } from './base.error';
import { BadRequestError } from './base.error';

/**
 * Handles errors in service layer methods.
 * Re-throws known application errors (NotFoundError, ValidationError, etc.) as-is.
 * Transforms unknown errors into InternalError.
 */
export function handleServiceError(error: unknown, fallbackMessage: string): never {
  if (
    error instanceof NotFoundError ||
    error instanceof ValidationError ||
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof ConflictError ||
    error instanceof BadRequestError
  ) {
    throw error;
  }

  throw new InternalError(
    error instanceof Error ? error.message : fallbackMessage,
    error instanceof Error ? error.stack : undefined,
  );
}
