import 'dotenv/config';
import { createApp } from './app';
import { loadConfig } from './config/env';
import { logger } from './utils/logger';

const config = loadConfig();
const app = createApp(config);
app.listen(config.port, () => logger.info({ port: config.port, service: config.serviceName }, 'SaltChat server started'));
