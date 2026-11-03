import type { AiProvider } from '../providers/ai-provider.interface';
import { MockProvider } from '../providers/mock.provider';
import { ClaudeProvider } from '../providers/claude.provider';
import { OpenAICompatibleProvider } from '../providers/openai-compatible.provider';
import { PrimaryGatewayProvider } from '../providers/primary-gateway.provider';
import { AiOrchestrator } from '../providers/ai-orchestrator';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';
import type { AppConfig } from '../config/env';

export function createProvider(config: AppConfig): AiProvider {
  if (config.aiProvider === 'mock') return new MockProvider();

  if (config.aiProvider === 'sdk' || config.aiProvider === 'primary') {
    if (!config.primaryApiKey || !config.primaryBaseUrl) {
      throw new Error('AI_PRIMARY_API_KEY and AI_PRIMARY_BASE_URL are required when AI_PROVIDER is sdk');
    }
    const primary = new PrimaryGatewayProvider(config.primaryApiKey, config.primaryBaseUrl, config.primaryBundleId);
    const fallback = config.fallbackApiKey
      ? new ClaudeProvider(config.fallbackApiKey, config.fallbackModel)
      : undefined;
    return new AiOrchestrator(primary, fallback);
  }

  if (!config.aiApiKey && !config.openAiApiKey) {
    throw new Error('AI_API_KEY is required when AI_PROVIDER is not mock');
  }
  const apiKey = config.aiApiKey || config.openAiApiKey as string;
  const model = config.aiModel || config.openAiModel || (config.aiProvider === 'claude' ? 'claude-sonnet-4-5' : 'gpt-4o-mini');
  if (config.aiProvider === 'claude') return new ClaudeProvider(apiKey, model);
  return new OpenAICompatibleProvider(apiKey, model, config.aiBaseUrl);
}

export class ChatService {
  constructor(private readonly provider: AiProvider, private readonly allowedModels: string[] = []) {}

  supportsModel(model: string): boolean {
    return this.allowedModels.length === 0 || this.allowedModels.includes(model);
  }

  generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    return this.provider.generateResponse(input);
  }
}
