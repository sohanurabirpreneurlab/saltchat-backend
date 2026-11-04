import type { ChatMessage } from '../types/chat.types';

// Keep enough recent context for continuity without sending an unbounded history.
export const MAX_CONTEXT_MESSAGES = 8;

export function getRecentContext(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(-MAX_CONTEXT_MESSAGES);
}
