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
      if (!service.supportsModel(input.model)) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Unsupported model', request_id: res.locals.requestId } });
        return;
      }
      const result = await service.generateResponse({
        message: input.message,
        model: input.model,
        conversationId: input.conversation_id ?? null,
        messages: input.messages,
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
      res.json({
        message: result.message,
        conversation_id: result.conversationId,
        messages: result.messages,
        ai: result.ai,
        source: result.source,
      });
    } catch (error) {
      next(error instanceof ZodError
        ? error
        : new ProviderError(error instanceof Error ? error.message : 'AI provider request failed', { cause: error }));
    }
  };
}
