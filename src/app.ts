import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { AppConfig } from './config/env';
import { chatRoutes } from './routes/chat.routes';
import { healthRoutes } from './routes/health.routes';
import { createProvider, ChatService } from './services/chat.service';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { errorMiddleware } from './middleware/error.middleware';

export function createApp(config: AppConfig, provider = createProvider(config)) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.use(cors({ origin: config.allowedOrigins.length ? config.allowedOrigins : false, credentials: false }));
  app.use(express.json({ limit: '256kb' }));
  app.use(healthRoutes(config));
  app.use('/api', chatRoutes(config, new ChatService(provider, config.allowedModelProviders)));
  app.use(errorMiddleware);
  return app;
}
