export interface ChatProviderInput {
  message: string;
  conversationId: string | null;
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
}
