import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SERVICE_NAME: z.string().trim().min(1).default('saltchat'),
  SERVICE_SECRET: z.string().min(1, 'SERVICE_SECRET is required'),
  ALLOWED_ORIGINS: z.string().default(''),
  AI_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type AppConfig = {
  port: number;
  serviceName: string;
  serviceSecret: string;
  allowedOrigins: string[];
  aiProvider: 'mock' | 'openai';
  openAiApiKey?: string;
  openAiModel: string;
  nodeEnv: 'development' | 'test' | 'production';
};

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(source);
  return {
    port: parsed.PORT,
    serviceName: parsed.SERVICE_NAME,
    serviceSecret: parsed.SERVICE_SECRET,
    allowedOrigins: parsed.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
    aiProvider: parsed.AI_PROVIDER,
    openAiApiKey: parsed.OPENAI_API_KEY,
    openAiModel: parsed.OPENAI_MODEL,
    nodeEnv: parsed.NODE_ENV,
  };
}
