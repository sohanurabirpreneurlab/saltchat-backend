import type { AiProvider } from './ai-provider.interface';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';

const LATEST_MESSAGE_INSTRUCTION = 'Answer only the latest user message. Use prior messages as context only when relevant; if the latest message is unrelated, ignore the earlier topic and answer it independently. Do not answer earlier questions again unless explicitly asked.';

export class OpenAICompatibleProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl = 'https://api.openai.com/v1',
  ) {}

  async generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: LATEST_MESSAGE_INSTRUCTION },
          ...input.messages,
          { role: 'user', content: input.message },
        ],
      }),
    });
    if (!response.ok) {
      let providerMessage = response.statusText || 'request failed';
      try {
        const errorData = await response.json() as { error?: { message?: string } };
        providerMessage = errorData.error?.message || providerMessage;
      } catch { /* Keep the HTTP status message when the provider does not return JSON. */ }
      throw new Error(`AI provider request failed (${response.status}): ${providerMessage}`);
    }
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const message = data.choices?.[0]?.message?.content;
    if (!message) throw new Error('AI provider returned an empty response');
    return {
      message,
      conversationId: input.conversationId,
      messages: [...input.messages, { role: 'user', content: input.message }, { role: 'assistant', content: message }],
    };
  }
}
