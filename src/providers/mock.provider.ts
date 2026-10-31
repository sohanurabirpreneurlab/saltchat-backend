import type { AiProvider } from './ai-provider.interface';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';

export class MockProvider implements AiProvider {
  async generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    return {
      message: `Mock response for: ${input.message}`,
      conversationId: input.conversationId,
    };
  }
}
