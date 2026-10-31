import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import type { AppConfig } from '../config/env';

function safelyEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function serviceAuthMiddleware(config: AppConfig): RequestHandler {
  return (req, res, next) => {
    const provided = req.header('x-service-key');
    if (!provided || !safelyEquals(provided, config.serviceSecret)) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', request_id: res.locals.requestId } });
      return;
    }
    next();
  };
}
