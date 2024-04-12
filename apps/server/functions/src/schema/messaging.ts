import {z} from 'zod';

export const messagingTokenSchema = z.string();

export const messagingTokenCreateSchema = z.object({
  messagingToken: messagingTokenSchema,
  platform: z.enum(['android', 'ios', 'web'])
});
