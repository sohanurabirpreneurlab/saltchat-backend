import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';

export interface AiProvider {
  generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse>;
}
