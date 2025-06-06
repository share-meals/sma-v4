import {shareAskStatusSchema} from './share';
import {z} from 'zod';

export const chatMessageSchema = z.object({
  chatId: z.string(),
  shareAskId: z.string().optional(),
  shareAskStatus: shareAskStatusSchema.optional(),
  text: z.string()
  .max(500)
  .min(2),
  timestamp: z.any(),
  userId: z.string()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
