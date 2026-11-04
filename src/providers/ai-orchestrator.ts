import type { AiProvider } from './ai-provider.interface';
import { isRetryableProviderError } from './provider-error';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';

export class AiOrchestrator implements AiProvider {
  constructor(
    private readonly primary: AiProvider,
    private readonly fallback?: AiProvider,
  ) {}

  async generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    try {
      return await this.primary.generateResponse(input);
    } catch (error) {
      if (!this.fallback || !isRetryableProviderError(error)) throw error;
      const response = await this.fallback.generateResponse(input);
      return { ...response, ai: { ...response.ai, route: 'fallback' }, source: 'fallback' };
    }
  }
}
