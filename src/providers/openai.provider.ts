import type { AiProvider } from './ai-provider.interface';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';

export class OpenAIProvider implements AiProvider {
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: input.message }],
      }),
    });
    if (!response.ok) {
      let providerMessage = response.statusText || 'request failed';
      try {
        const errorData = await response.json() as { error?: { message?: string } };
        providerMessage = errorData.error?.message || providerMessage;
      } catch {
        // Keep the HTTP status message when the provider does not return JSON.
      }
      throw new Error(`OpenAI request failed (${response.status}): ${providerMessage}`);
    }
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const message = data.choices?.[0]?.message?.content;
    if (!message) throw new Error('OpenAI returned an empty response');
    return { message, conversationId: input.conversationId };
  }
}
