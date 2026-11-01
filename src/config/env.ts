import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SERVICE_NAME: z.string().trim().min(1).default('saltchat'),
  SERVICE_SECRET: z.string().min(1, 'SERVICE_SECRET is required'),
  ALLOWED_ORIGINS: z.string().default(''),
  AI_PROVIDER: z.enum(['mock', 'openai', 'claude', 'openai-compatible']).default('mock'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI_BASE_URL: z.string().url().optional(),
  // Backward-compatible OpenAI settings. New deployments should use AI_*.
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type AppConfig = {
  port: number;
  serviceName: string;
  serviceSecret: string;
  allowedOrigins: string[];
  aiProvider: 'mock' | 'openai' | 'claude' | 'openai-compatible';
  aiApiKey?: string;
  aiModel?: string;
  aiBaseUrl?: string;
  /** @deprecated Use aiApiKey and aiModel. */
  openAiApiKey?: string;
  /** @deprecated Use aiModel. */
  openAiModel?: string;
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
    aiApiKey: parsed.AI_API_KEY || parsed.OPENAI_API_KEY,
    aiModel: parsed.AI_MODEL || parsed.OPENAI_MODEL || 'gpt-4o-mini',
    aiBaseUrl: parsed.AI_BASE_URL,
    openAiApiKey: parsed.AI_API_KEY || parsed.OPENAI_API_KEY,
    openAiModel: parsed.AI_MODEL || parsed.OPENAI_MODEL || 'gpt-4o-mini',
    nodeEnv: parsed.NODE_ENV,
  };
}
