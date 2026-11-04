import type { AiProvider } from './ai-provider.interface';
import { ProviderRequestError } from './provider-error';
import type { ChatProviderInput, ChatProviderResponse } from '../types/chat.types';

const LATEST_MESSAGE_INSTRUCTION = [
  'Answer the latest user message only.',
  'Use the conversation history only as context when it is relevant to the latest message.',
  'If the latest message is unrelated to the history, ignore the earlier topic and answer the latest message independently.',
  'Do not answer earlier questions again unless the latest message explicitly asks about them.',
].join(' ');

export class PrimaryGatewayProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly bundleId: string,
  ) {}

  async generateResponse(input: ChatProviderInput): Promise<ChatProviderResponse> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 30_000);
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/v1/turns`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          bundleId: this.bundleId,
          provider: input.model,
          userMessage: `${LATEST_MESSAGE_INSTRUCTION}\n\nLatest user message:\n${input.message}`,
          messages: input.messages,
        }),
        signal: abortController.signal,
      });
    } catch (error) {
      throw new ProviderRequestError(error instanceof Error && error.name === 'AbortError' ? 'Primary gateway request timed out' : 'Primary gateway request failed');
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new ProviderRequestError(`Primary gateway request failed (${response.status})`, response.status, isRetryableStatus(response.status));
    }

    const data = await response.json() as { assistantText?: string; messages?: ChatProviderResponse['messages'] };
    if (!data.assistantText) throw new ProviderRequestError('Primary gateway returned an empty response');
    return {
      message: data.assistantText,
      conversationId: input.conversationId,
      messages: data.messages ?? [...input.messages, { role: 'user', content: input.message }, { role: 'assistant', content: data.assistantText }],
      source: 'sdk',
    };
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 402 || status === 408 || status === 429 || status >= 500;
}
