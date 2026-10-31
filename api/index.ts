import 'dotenv/config';
import { createApp } from '../src/app';
import { loadConfig } from '../src/config/env';

export default createApp(loadConfig());
