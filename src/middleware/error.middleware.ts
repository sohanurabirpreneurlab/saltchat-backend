import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class ProviderError extends Error {
  constructor(public readonly publicMessage: string, options?: ErrorOptions) {
    super('AI provider request failed', options);
    this.name = 'ProviderError';
  }
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, next) => {
  void next;
  const requestId = res.locals.requestId;
  if (error instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', request_id: requestId } });
    return;
  }
  logger.error({ err: error, requestId }, 'Unhandled request error');
  const isProviderError = error instanceof ProviderError;
  res.status(isProviderError ? 502 : 500).json({
    error: {
      code: isProviderError ? 'PROVIDER_ERROR' : 'INTERNAL_ERROR',
      message: isProviderError ? error.publicMessage : 'Internal server error',
      request_id: requestId,
    },
  });
};
