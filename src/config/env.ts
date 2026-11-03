import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SERVICE_NAME: z.string().trim().min(1).default('saltchat'),
  SERVICE_SECRET: z.string().min(1, 'SERVICE_SECRET is required'),
  ALLOWED_ORIGINS: z.string().default(''),
  AI_PROVIDER: z.enum(['mock', 'primary', 'sdk', 'openai', 'claude', 'openai-compatible']).default('mock'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI_BASE_URL: z.string().url().optional(),
  AI_PRIMARY_API_KEY: z.string().optional(),
  AI_PRIMARY_BASE_URL: z.string().url().optional(),
  AI_PRIMARY_BUNDLE_ID: z.string().trim().min(1).default('generic'),
  AI_MODEL_PROVIDER: z.string().default('gemini'),
  AI_FALLBACK_API_KEY: z.string().optional(),
  AI_FALLBACK_MODEL: z.string().trim().min(1).default('claude-sonnet-4-5'),
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
  aiProvider: 'mock' | 'primary' | 'sdk' | 'openai' | 'claude' | 'openai-compatible';
  aiApiKey?: string;
  aiModel?: string;
  aiBaseUrl?: string;
  primaryApiKey?: string;
  primaryBaseUrl?: string;
  primaryBundleId: string;
  allowedModelProviders: string[];
  fallbackApiKey?: string;
  fallbackModel: string;
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
    primaryApiKey: parsed.AI_PRIMARY_API_KEY || parsed.AI_API_KEY,
    primaryBaseUrl: parsed.AI_PRIMARY_BASE_URL || parsed.AI_BASE_URL,
    primaryBundleId: parsed.AI_PRIMARY_BUNDLE_ID,
    allowedModelProviders: parsed.AI_MODEL_PROVIDER.split(',').map((model) => model.trim()).filter(Boolean),
    fallbackApiKey: parsed.AI_FALLBACK_API_KEY,
    fallbackModel: parsed.AI_FALLBACK_MODEL,
    openAiApiKey: parsed.AI_API_KEY || parsed.OPENAI_API_KEY,
    openAiModel: parsed.AI_MODEL || parsed.OPENAI_MODEL || 'gpt-4o-mini',
    nodeEnv: parsed.NODE_ENV,
  };
}
