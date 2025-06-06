import {z} from 'zod';

export const shareAskSchema = z.object({
  postId: z.string(),
  message: z.string()
  .min(5)
  .max(500)
});

export const shareAskStatusSchema = z.enum([
  'accepted',
  'denied',
  'pending'
]);
