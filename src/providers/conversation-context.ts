import type { ChatMessage } from '../types/chat.types';

// Keep enough recent context for continuity without sending an unbounded history.
export const MAX_CONTEXT_MESSAGES = 8;

export const LATEST_MESSAGE_INSTRUCTION_PREFIX = 'Answer the latest user message only.';

export function removeInternalInstructionMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => (
    message.role !== 'user' || !message.content.startsWith(LATEST_MESSAGE_INSTRUCTION_PREFIX)
  ));
}

export function getRecentContext(messages: ChatMessage[]): ChatMessage[] {
  return removeInternalInstructionMessages(messages).slice(-MAX_CONTEXT_MESSAGES);
}
