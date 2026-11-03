import type { AiProvider } from './ai-provider.interface';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';

export class MockProvider implements AiProvider {
  async generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    const message = `Mock response for: ${input.message}`;
    return {
      message,
      conversationId: input.conversationId,
      messages: [...input.messages, { role: 'user', content: input.message }, { role: 'assistant', content: message }],
    };
  }
}
