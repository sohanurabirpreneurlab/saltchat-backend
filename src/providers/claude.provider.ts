import type { AiProvider } from './ai-provider.interface';
import { getRecentContext } from './conversation-context';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';

const LATEST_MESSAGE_INSTRUCTION = 'Answer only the latest user message. Use prior messages as context only when relevant; if the latest message is unrelated, ignore the earlier topic and answer it independently. Do not answer earlier questions again unless explicitly asked.';

export class ClaudeProvider implements AiProvider {
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
    body: JSON.stringify({
      model: this.model,
      max_tokens: 1024,
      system: LATEST_MESSAGE_INSTRUCTION,
      messages: [...getRecentContext(input.messages), { role: 'user', content: input.message }],
    }),
    });
    if (!response.ok) {
      let providerMessage = response.statusText || 'request failed';
      try {
        const errorData = await response.json() as { error?: { message?: string } };
        providerMessage = errorData.error?.message || providerMessage;
      } catch { /* Keep the HTTP status message when the provider does not return JSON. */ }
      throw new Error(`Claude request failed (${response.status}): ${providerMessage}`);
    }
    const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
    const message = data.content?.find((block) => block.type === 'text')?.text;
    if (!message) throw new Error('Claude returned an empty response');
    return {
      message,
      conversationId: input.conversationId,
      messages: [...input.messages, { role: 'user', content: input.message }, { role: 'assistant', content: message }],
    };
  }
}
