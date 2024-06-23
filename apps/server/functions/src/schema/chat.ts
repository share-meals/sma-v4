import {z} from 'zod';

export const chatSchema = z.object({
  text: z.string()
  .max(500)
  .min(2),
  timestamp: z.any(),
  userId: z.string(),  
});
