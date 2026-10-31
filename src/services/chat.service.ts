import type { AiProvider } from '../providers/ai-provider.interface';
import { MockProvider } from '../providers/mock.provider';
import { OpenAIProvider } from '../providers/openai.provider';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';
import type { AppConfig } from '../config/env';

export function createProvider(config: AppConfig): AiProvider {
  if (config.aiProvider === 'openai') {
    if (!config.openAiApiKey) throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai');
    return new OpenAIProvider(config.openAiApiKey, config.openAiModel);
  }
  return new MockProvider();
}

export class ChatService {
  constructor(private readonly provider: AiProvider) {}

  generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    return this.provider.generateResponse(input);
  }
}
