import { Router } from 'express';
import type { AppConfig } from '../config/env';
import { createChatController } from '../controllers/chat.controller';
import { serviceAuthMiddleware } from '../middleware/auth.middleware';
import { createChatRateLimiter } from '../middleware/rate-limit.middleware';
import type { ChatService } from '../services/chat.service';

export function chatRoutes(config: AppConfig, service: ChatService): Router {
  const router = Router();
  router.post('/chat', serviceAuthMiddleware(config), createChatRateLimiter(), createChatController(service));
  return router;
}
