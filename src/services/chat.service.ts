import type { AiProvider } from '../providers/ai-provider.interface';
import { MockProvider } from '../providers/mock.provider';
import { ClaudeProvider } from '../providers/claude.provider';
import { OpenAICompatibleProvider } from '../providers/openai-compatible.provider';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';
import type { AppConfig } from '../config/env';

export function createProvider(config: AppConfig): AiProvider {
  if (config.aiProvider === 'mock') return new MockProvider();
  if (!config.aiApiKey && !config.openAiApiKey) {
    throw new Error('AI_API_KEY is required when AI_PROVIDER is not mock');
  }
  const apiKey = config.aiApiKey || config.openAiApiKey as string;
  const model = config.aiModel || config.openAiModel || (config.aiProvider === 'claude' ? 'claude-sonnet-4-5' : 'gpt-4o-mini');
  if (config.aiProvider === 'claude') return new ClaudeProvider(apiKey, model);
  return new OpenAICompatibleProvider(apiKey, model, config.aiBaseUrl);
}

export class ChatService {
  constructor(private readonly provider: AiProvider) {}

  generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    return this.provider.generateResponse(input);
  }
}
