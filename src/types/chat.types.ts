export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatProviderInput {
  message: string;
  model: string;
  conversationId: string | null;
  messages: ChatMessage[];
  context?: Record<string, unknown>;
  user: {
    id: string;
    email?: string;
    displayName?: string;
    role?: string;
    department?: string;
    clientIds?: string[];
  };
}

export interface ChatProviderResponse {
  message: string;
  conversationId: string | null;
  messages: ChatMessage[];
}
