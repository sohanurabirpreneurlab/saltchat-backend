import type { RequestHandler } from 'express';
import { chatRequestSchema } from '../schemas/chat.schema';
import { ProviderError } from '../middleware/error.middleware';
import type { ChatService } from '../services/chat.service';
import { ZodError } from 'zod';

export function createChatController(service: ChatService): RequestHandler {
  return async (req, res, next) => {
    let input;
    try {
      input = chatRequestSchema.parse(req.body);
    } catch (error) {
      next(error);
      return;
    }
    try {
      const result = await service.generateResponse({
        message: input.message,
        conversationId: input.conversation_id ?? null,
        context: input.context,
        user: {
          id: input.user.id,
          email: input.user.email,
          displayName: input.user.display_name,
          role: input.user.role,
          department: input.user.department,
          clientIds: input.user.client_ids,
        },
      });
      res.json({ message: result.message, conversation_id: result.conversationId });
    } catch (error) {
      next(error instanceof ZodError
        ? error
        : new ProviderError(error instanceof Error ? error.message : 'AI provider request failed', { cause: error }));
    }
  };
}
