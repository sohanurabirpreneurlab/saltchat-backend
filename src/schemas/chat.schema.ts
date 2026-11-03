import { z } from 'zod';

const userSchema = z.object({
  id: z.string().trim().min(1),
  email: z.string().email().optional(),
  display_name: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  client_ids: z.array(z.string().trim().min(1)).optional(),
}).strict();

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(16000),
}).strict();

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(8000),
  model: z.string().trim().min(1).max(100),
  conversation_id: z.string().trim().min(1).nullable().optional(),
  messages: z.array(messageSchema).max(100).optional().default([]),
  context: z.record(z.unknown()).optional(),
  user: userSchema,
}).strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
