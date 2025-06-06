import {shareAskStatusSchema} from './share';
//import {Timestamp} from 'firebase/firestore';
import {z} from 'zod';

export const chatSchema = z.object({
  blockedBy: z.array(z.string()).optional(),
  timestamp: z.any(), // instanceof(Timestamp),
  users: z.record(z.string(), z.literal(true)),
})

export type Chat = z.infer<typeof chatSchema>;

export const chatMessageSchema = z.object({
  chatId: z.string(),
  shareAskId: z.string().optional(),
  shareAskStatus: shareAskStatusSchema.optional(),
  text: z.string()
  .max(500)
  .min(2),
  timestamp: z.any(), // instanceof(Timestamp),
  userId: z.string()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
