import { Router } from 'express';
import type { AppConfig } from '../config/env';

export function healthRoutes(config: AppConfig): Router {
  const router = Router();
  router.get('/health', (_req, res) => res.json({ status: 'ok', service: config.serviceName }));
  return router;
}
